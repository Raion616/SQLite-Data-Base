const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express');
const openApiDocument = require('./openapi.json');
const database = require('better-sqlite3');
const db = new database('tasks.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER DEFAULT 0
  )
`);
const insertTask = db.prepare('INSERT INTO tasks (title,done) VALUES (?,?)');
const countTasks = db.prepare('SELECT COUNT(*) AS count FROM tasks');
const { count } = countTasks.get();
if (count === 0) {
    insertTask.run('first task',1);
    insertTask.run('second task',0);
    insertTask.run('third Task',1);
}
const PORT = 3000;
app.use(express.json());


app.get('/tasks', (req, res) => {
    res.send(db.prepare('SELECT * FROM tasks').all());
})

app.get('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id,10);
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    if (!task) {
        return res.status(404).send('task ' + taskId + ' not found');
    }
    res.json(task);
})

app.get('/health', (req, res) => {
    res.send({ "status": "ok" });
});

app.get('/', (req, res) => {
    res.json({ "name": "Task API", "version": "1.0", "endpoints": ["/tasks"] });
});


app.post('/tasks', (req, res) => {
    const {title} = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Task title is required' });
    }
    insertTask.run(title,0);
    res.status(201).json("Task created!");
})

app.put('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const Task = tasks.find(t => t.id === parseInt(id));
    if (!Task) {
        return res.status(404).json({ error: 'Task '+ id +' not found' });
    }
    let text = req.body.title;
    if ("done" in req.body) {
        if(req.body.done.toUpperCase() === "True".toUpperCase()){Task.done = true;}
        else if(req.body.done.toUpperCase() === "False".toUpperCase()){Task.done = false;}
        else {return res.status(400).json({ error: 'please enter a valid done case' });}
    }
    if (!text) {
        return res.status(400).json({ error: 'Task title is required' });
    }
    Task.title = req.body.title;
    res.status(200).json("Task updated!");
})

app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;
    let task = tasks.find(t => t.id === parseInt(id));
    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }
    tasks = tasks.filter(t => t.id !== parseInt(id));
    res.status(204).json(task[id]);
})
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(`Swagger UI on http://localhost:${PORT}/api-docs`);
});