import { Alert, Button, Card, CardContent, Checkbox, Container, FormControlLabel, MenuItem, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { assignTests, createTest, createUser, getCategories, getResults, getUsers, resetAttempt } from "../services/api";
import JsonEditor from "../components/JsonEditor";

const difficultyLabels: Record<string, string> = { junior: "Junior", middle: "Middle", senior: "Senior", lead: "Lead" };
const defaultQuestionsJson = JSON.stringify([{ id: 1, text: "Вопрос 1", options: ["Ответ A", "Ответ B", "Ответ C", "Ответ D"], correct: [0] }], null, 2);

export default function AdminPanelPage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [users, setUsers] = useState<any[]>([]), [categories, setCategories] = useState<any[]>([]), [results, setResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState(""), [selectedTests, setSelectedTests] = useState<number[]>([]);
  const [newUserName, setNewUserName] = useState(""), [newUserEmail, setNewUserEmail] = useState(""), [newUserPassword, setNewUserPassword] = useState(""), [newUserRole, setNewUserRole] = useState("worker");
  const [testTitle, setTestTitle] = useState(""), [testDescription, setTestDescription] = useState(""), [testCategory, setTestCategory] = useState("Общая"), [testDifficulty, setTestDifficulty] = useState("junior"), [testTimeLimit, setTestTimeLimit] = useState("60"), [testQuestions, setTestQuestions] = useState(defaultQuestionsJson);
  const [links, setLinks] = useState<any[]>([]), [message, setMessage] = useState(""), [error, setError] = useState("");

  async function loadData() { setUsers(await getUsers()); setCategories(await getCategories()); setResults(await getResults()); }
  useEffect(() => { loadData(); }, []);
  const ok = (text: string) => { setError(""); setMessage(text); };
  const fail = (text: string) => { setMessage(""); setError(text); };
  const toggle = (id: number) => setSelectedTests(selectedTests.includes(id) ? selectedTests.filter(x => x !== id) : [...selectedTests, id]);

  async function addUser() { try { await createUser({ full_name: newUserName, email: newUserEmail, password: newUserPassword, role: newUserRole }); setNewUserName(""); setNewUserEmail(""); setNewUserPassword(""); await loadData(); ok("Пользователь добавлен"); } catch (e: any) { fail(e.message); } }
  async function addTest() { try { const questions = JSON.parse(testQuestions); if (!Array.isArray(questions)) throw new Error("Вопросы должны быть массивом JSON"); await createTest({ title: testTitle, description: testDescription, category: testCategory, difficulty: testDifficulty, timeLimit: Number(testTimeLimit), questions }); setTestTitle(""); setTestDescription(""); setTestCategory("Общая"); setTestTimeLimit("60"); setTestQuestions(defaultQuestionsJson); await loadData(); ok("Тест добавлен"); } catch (e: any) { fail(e.message); } }
  async function assign() { try { if (!selectedUser || !selectedTests.length) throw new Error("Выберите пользователя и хотя бы один тест"); const response = await assignTests({ userId: selectedUser, testIds: selectedTests }); setLinks(response.links || []); await loadData(); ok("Тесты назначены. Индивидуальные ссылки созданы."); } catch (e: any) { fail(e.message); } }
  async function reset(userId: number, testId: number) { try { await resetAttempt(userId, testId); await loadData(); ok("Попытка сброшена"); } catch (e: any) { fail(e.message); } }
  async function copyLink(url: string) { await navigator.clipboard.writeText(url); ok("Ссылка скопирована"); }

  if (user.role !== "admin") return <Typography>Нет доступа</Typography>;
  return <Container sx={{ mt: 4, mb: 5 }}>
    <Typography variant="h4">Админ панель</Typography>
    {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}{error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

    <Card sx={{ mt: 3 }}><CardContent><Typography variant="h6">1. Добавить пользователя</Typography>
      <TextField fullWidth label="ФИО" sx={{ mt: 2 }} value={newUserName} onChange={e=>setNewUserName(e.target.value)}/><TextField fullWidth label="Логин / Email" sx={{ mt: 2 }} value={newUserEmail} onChange={e=>setNewUserEmail(e.target.value)}/><TextField fullWidth type="password" label="Пароль" sx={{ mt: 2 }} value={newUserPassword} onChange={e=>setNewUserPassword(e.target.value)}/><TextField select fullWidth label="Роль" sx={{ mt: 2 }} value={newUserRole} onChange={e=>setNewUserRole(e.target.value)}><MenuItem value="worker">Пользователь</MenuItem><MenuItem value="admin">Администратор</MenuItem></TextField><Button variant="contained" sx={{ mt: 2 }} onClick={addUser}>Добавить</Button>
    </CardContent></Card>

    <Card sx={{ mt: 3 }}><CardContent><Typography variant="h6">2. Добавить тест</Typography><Typography sx={{ mt: 1 }}>Категории работают как в первом архиве: каждый тест относится к указанной категории.</Typography>
      <TextField fullWidth label="Название теста" sx={{ mt: 2 }} value={testTitle} onChange={e=>setTestTitle(e.target.value)}/><TextField fullWidth label="Описание" sx={{ mt: 2 }} value={testDescription} onChange={e=>setTestDescription(e.target.value)}/><TextField fullWidth label="Категория" sx={{ mt: 2 }} value={testCategory} onChange={e=>setTestCategory(e.target.value)}/><TextField select fullWidth label="Уровень сложности" sx={{ mt: 2 }} value={testDifficulty} onChange={e=>setTestDifficulty(e.target.value)}>{Object.entries(difficultyLabels).map(([v,l])=><MenuItem key={v} value={v}>{l}</MenuItem>)}</TextField><TextField fullWidth type="number" label="Время сдачи всего теста, секунд" sx={{ mt: 2 }} value={testTimeLimit} onChange={e=>setTestTimeLimit(e.target.value)}/><JsonEditor value={testQuestions} onChange={setTestQuestions}/><Button variant="contained" sx={{ mt: 2 }} onClick={addTest}>Добавить тест</Button>
    </CardContent></Card>

    <Card sx={{ mt: 3 }}><CardContent><Typography variant="h6">3. Назначить тест и создать индивидуальную ссылку</Typography>
      <TextField select fullWidth label="Пользователь" sx={{ mt: 2 }} value={selectedUser} onChange={e=>setSelectedUser(e.target.value)}>{users.filter(u=>u.role==="worker").map(u=><MenuItem key={u.id} value={u.id}>{u.full_name} — {u.email}</MenuItem>)}</TextField>
      {Object.entries(categories.reduce((acc:any,t:any)=>{(acc[t.category||"Общая"] ||= []).push(t);return acc;},{})).map(([category, tests]:any)=><div key={category}><Typography sx={{ mt: 2, fontWeight: 700 }}>{category}</Typography>{tests.map((t:any)=><FormControlLabel key={t.id} control={<Checkbox checked={selectedTests.includes(t.id)} onChange={()=>toggle(t.id)}/>} label={`${t.title} — ${difficultyLabels[t.difficulty]||t.difficulty} — ${t.questionsCount} вопросов — ${t.timeLimit} сек.`}/>)}</div>)}
      <Button variant="contained" sx={{ mt: 2 }} onClick={assign}>Назначить и создать ссылки</Button>
      {links.map(link=><Card key={link.token} variant="outlined" sx={{ mt: 2 }}><CardContent><Typography>{link.testTitle}</Typography><Typography sx={{ wordBreak:"break-all" }}>{link.url}</Typography><Button size="small" onClick={()=>copyLink(link.url)}>Копировать</Button></CardContent></Card>)}
    </CardContent></Card>

    <Card sx={{ mt: 3 }}><CardContent><Typography variant="h6">4. Результаты и сброс попыток</Typography>{results.length===0&&<Typography sx={{mt:1}}>Пока нет прохождений.</Typography>}{results.map(r=><Card key={r.id} variant="outlined" sx={{mt:2}}><CardContent><Typography><b>{r.userName}</b> — {r.testTitle}</Typography><Typography>Результат: {r.score}/{r.total}</Typography><Button sx={{mt:1}} onClick={()=>reset(r.userId,r.testId)}>Сбросить попытку</Button></CardContent></Card>)}</CardContent></Card>
  </Container>;
}
