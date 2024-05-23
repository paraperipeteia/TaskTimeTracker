var widgetList = [];
let taskList = new Object();
var tasksGenerated = 0;
AddTaskForm();
AddLoadButton();
AddSaveButton();
AddTaskListListener();
AddNotes();
AddTitle();

class Task {
    constructor(title, id, seconds, generatedTimestamp) {
        this.title = title;
        this.id = id;
        this.totalSeconds = seconds;
        this.timeout = null; 
        this.timerStarted = false;
        this.timeStamp = generatedTimestamp == null ? Date.now() : generatedTimestamp;
    }

    StartTimer(tId, startTime) {

        if (taskList[tId].timerStarted == true)
        {
            return;
        }

        function OnTimeoutUpdated(task) {
            if (task.timerStarted == false) {
                clearTimeout(task.timeout);
                return;
            }

            task.totalSeconds++;
            var elem = document.getElementById(`${task.id}-time`)
            if (elem != null) {
                elem.innerHTML = GenerateDisplayTime(task);
                var timeout = setTimeout(() => OnTimeoutUpdated(task), 1000);
            }
        }

        taskList[tId].totalSeconds = startTime;
        taskList[tId].timerStarted = true;
        var timeout = setTimeout(() => OnTimeoutUpdated(taskList[tId]), 1000);    
    }

    PauseTimer(tId) {
        taskList[tId].timerStarted = false;
    }

    ResumeTimer(tId) {
        // make sure timer is not already running
        if (taskList[tId].timerStarted == true) {
            return;
        }
        taskList[tId].StartTimer(tId, taskList[tId].totalSeconds);
    }

    RemoveTask(tId) {
        taskList[tId].timerStarted = false;
        clearTimeout(taskList[tId].timeout);
    }
}

function AddTitle() {
    document.getElementById("topHeader").innerHTML = TimeTrackerTitle();
    AnimateText("pHeader");
}

function GenerateDisplayTime(task) {
    var seconds = task.totalSeconds;
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var seconds = seconds % 60;
    var displayTime = `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
    return `${displayTime}. ${GenerateTaskStartTime(task)}`;
}

function GenerateTaskStartTime(task){
    var date = new Date(task.timeStamp);
    return "Task started at: " + date.toLocaleString(); 
}

function GenerateTaskWidget(task) {
    var displayTime = GenerateDisplayTime(task);
    return `<div id="${task.id}" class="task-widget">
        <h3 class="widgetName">${task.title}</h3>
        <p><div class="widgetTime" id="${task.id}-time">${displayTime}</div></p>
        <button id="startTimerBtn-${task.id}">Start</button>
        <button id="pauseTimerBtn-${task.id}">Pause</button>
        <button id="resumeTimerBtn-${task.id}">Resume</button>
        <button id="removeTaskBtn-${task.id}">Remove</button>
        </div>`;
}

function LoadExistingTask(name, id, seconds, generatedTimestamp) {
    var task = new Task(name, id, seconds, generatedTimestamp);
    taskList[id] = task;
    var widget = GenerateTaskWidget(task);
    document.getElementById("task-list").innerHTML += widget;
    widgetList.push(widget);
}

function AddTask(name) {

    if (name == "" || name == null) {
        alert("Please enter a task name");
        return;
    }

    // if task already exists
    for (var i = 0; i < widgetList.length; i++) {
        if (widgetList[i].title == name) {
            alert("Task already exists");
            return;
        }
    }
    // generate a unique id for the task
    var taskId = `task${tasksGenerated++}`;
    var task = new Task(name,taskId, 0, null);
    taskList[taskId] = task;
    var widget = GenerateTaskWidget(task);
    document.getElementById("task-list").innerHTML += widget;
    widgetList.push(widget);
}

function RemoveTask(taskId) {
    var index = widgetList.findIndex((widget) => widget.includes(taskId));
    widgetList.splice(index, 1);
    taskList[taskId] = null; 
    document.getElementById("task-list").innerHTML = widgetList.join("");
}

function AddLoadButton() {
    var button = `<button id="loadButton">Load Tasks</button>`;
    document.getElementById("form-parent").innerHTML += button;
}

function AddSaveButton() {
    var button = `<button id="saveButton">Save Tasks</button>`;
    document.getElementById("form-parent").innerHTML += button;
}

function AddTaskForm() {
    var form =`<form id="task-form">
    <input type="text" id="task-name" placeholder="Task Name">
    <button id="submitBtn">Add Task</button></form>`;
    document.getElementById("form-parent").innerHTML += form;
    document.getElementById("form-parent").addEventListener("submit", (event) => {
        TaskformSubmit(event);});
}

function TaskformSubmit(event) {
    event.preventDefault();
    var name = document.getElementById("task-name").value;
    AddTask(name);
}

function LoadTasks() {
    var tasks = JSON.parse(localStorage.getItem("tasks"));
    tasksGenerated = localStorage.getItem("tasksGenerated");
    if (tasks != null && tasks != undefined && tasks != "") {
        taskList = null; 
        taskList = new Object();
        for (var key in tasks) {
            var seconds = parseInt(tasks[key].totalSeconds);
            LoadExistingTask(tasks[key].title, tasks[key].id, seconds, tasks[key].timeStamp);
        }
    }
}

function SaveTasks() {
    // create a new object containing only non-null tasks then save that out to local storage
    var tasks = new Object();
    for (var key in taskList) {
        if (taskList[key] != null) {
            tasks[key] = taskList[key];
        }
    }
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("tasksGenerated", tasksGenerated);
}

function AddTaskListListener() {
    document.getElementById("form-parent").addEventListener("click", (e) => {
        if (e.target.tagName === "BUTTON") {
            if (e.target.id.includes("saveButton")) {
                SaveTasks();
            }
            else if (e.target.id.includes("loadButton")) {
                LoadTasks();
            }
            else if (e.target.id.includes("noteBtn")) {
                ToggleNotes();
            }
        }
    });

    document.getElementById("task-list").addEventListener("click", (e) => {
        //check if the clicked element is a button
        if (e.target.tagName === "BUTTON") {
            var id = e.target.id.split("-")[1];
            if (e.target.id.includes("startTimerBtn")) {
                taskList[id].StartTimer(id, 0);
            }
            else if (e.target.id.includes("pauseTimerBtn")) {
                taskList[id].PauseTimer(id);
            }
            else if (e.target.id.includes("resumeTimerBtn")) {
                taskList[id].ResumeTimer(id);
            }
            else if (e.target.id.includes("removeTaskBtn")) {
                RemoveTask(id);

            }
            else if (e.target.id.includes("addTaskBtn")) {
                AddTask();
            }
            else if (e.target.id.includes("loadButton")) {
                LoadTasks();
            }
        } 
    });
}

function ToggleNotes() {
    var notes = document.getElementById("notes");
    if (notes.style.display === "none" || notes.style.display === "") {
        notes.style.display = "block";
        document.getElementById("noteBtn").innerHTML = "Hide Notes";
    }
    else {
        notes.style.display = "none";
        document.getElementById("noteBtn").innerHTML = "Show Notes";
    }

}
function AddNotes() {
    var noteBtn = `<button id="noteBtn">Hide Notes</button>`;
    document.getElementById("form-parent").innerHTML += noteBtn;
    var notes = `<div id="notes">
        <h3 align="center">Notes</h3>
        <p>Some basic tips for using this simple time tracker: </p>
        <p>1. Click the "Add Task" button to add a new task</p>
        <p>2. Click the "Start" button to start the timer for a task</p>
        <p>3. Click the "Pause" button to pause the timer for a task</p>
        <p>4. Click the "Resume" button to resume the timer for a task</p>
        <p>5. Click the "Remove" button to remove a task</p>
        <p>6. Click the "Save Tasks" button to save your tasks</p>
        <p>7. Click the "Load Tasks" button to load your saved tasks</p>
        <p align="center"><b>Cautions</b></p>
        <p>- If you refresh the page, your tasks will be lost</p>
        <p>- If you clear your browser's local storage, your tasks will be lost</p>
        <p>- If you close your browser, your tasks will be lost so make sure to save!</p>
        <p>- Saving will overwrite any previously saved tasks</p>
        <p align="center"><b> *** Message me regarding questions or feedback - David M. *** </b></p>
    </div>`;
    document.getElementById("form-parent").innerHTML += notes;
    document.getElementById("notes").style.display = "block";
}

function TimeTrackerTitle() {

    var str=`<p id="paragraphA" class="pHeader">░ΔΔΔΔΔΔΔΔ░░ΔΔΔΔΔΔΔΔ░░ΔΔ░░░░ΔΔ░░ΔΔΔΔΔΔΔΔ░░░░░░░░ΔΔΔΔΔΔΔΔ░░ΔΔΔΔΔΔΔ░░░░ΔΔΔΔΔΔ░░░░ΔΔΔΔΔΔ░░░ΔΔ░░░░ΔΔ░░ΔΔΔΔΔΔΔΔ░░ΔΔΔΔΔΔΔ░░</p>`;
    str += `<p id="paragraphB" class="pHeader">▒▒▒▒ΔΔ▒▒▒▒▒▒▒▒ΔΔ▒▒▒▒▒ΔΔΔ▒▒ΔΔΔ▒▒ΔΔ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ΔΔ▒▒▒▒▒ΔΔ▒▒▒▒ΔΔ▒▒ΔΔ▒▒▒▒ΔΔ▒▒ΔΔ▒▒▒▒ΔΔΔ▒ΔΔ▒▒▒ΔΔ▒▒▒ΔΔ▒▒▒▒▒▒▒▒ΔΔ▒▒▒▒ΔΔ▒</p>`;
    str += `<p id="paragraphC" class="pHeader">▓▓▓▓ΔΔ▓▓▓▓▓▓▓▓ΔΔ▓▓▓▓▓ΔΔΔΔΔΔΔΔ▓▓ΔΔΔΔΔΔ▓▓▓▓▓▓▓▓▓▓▓▓▓ΔΔ▓▓▓▓▓ΔΔΔΔΔΔΔ▓▓▓ΔΔ▓▓▓▓ΔΔ▓▓ΔΔ▓▓▓▓▓▓▓▓ΔΔΔΔΔ▓▓▓▓▓ΔΔΔΔΔΔ▓▓▓▓ΔΔΔΔΔΔΔ▓▓</p>`;
    str += `<p id="paragraphD" class="pHeader">████ΔΔ████████ΔΔ█████ΔΔ█ΔΔ█ΔΔ██ΔΔ█████████████████ΔΔ█████ΔΔ███ΔΔ███ΔΔΔΔΔΔΔΔ██ΔΔ████ΔΔ██ΔΔ███ΔΔ███ΔΔΔ███████ΔΔ███ΔΔ██</p>`;
    str += `<p id="paragraphE" class="pHeader">████ΔΔ█████ΔΔΔΔΔΔΔΔ██ΔΔ████ΔΔ██ΔΔΔΔΔΔΔΔ███████████ΔΔ█████ΔΔ████ΔΔ██ΔΔ████ΔΔ███ΔΔΔΔΔΔ███ΔΔ████ΔΔ██ΔΔΔΔΔΔΔΔ██ΔΔ████ΔΔ█</p>`;
    return str;                                                                                                         
}

function AnimateElement(elem) {
    var text = elem.innerHTML;   
    elem.innerHTML = "";
    var newText = "";
    var currentIndex = 0;

    function AdvanceAnimation() {
        if (text.length == 0 || currentIndex == text.length) {
            return;
        }
        newText += text[currentIndex++];
        elem.innerHTML = newText;
        var speed = Math.floor(Math.random() * 70);
        setTimeout(() => AdvanceAnimation(), speed);
    }

    setTimeout(() => AdvanceAnimation(), 100);
}

function OnTitleAnimationCompleted() {
    var elems = document.getElementsByClassName("pHeader");
    for (var i = 0; i < elems.length; i++) {
        ScrambleText(elems[i].innerHTML, elems[i].id);
    }
}

function ScrambleText(original, elementId) {

    function AdvanceScramble(original, newText, currentIndex, elementId) {  
        if (currentIndex == original.length) {
            document.getElementById(elementId).innerHTML = original;
            return;
        }

        var random = Math.floor(Math.random() * original.length);
        newText += original[random];
        currentIndex++;
        document.getElementById(elementId).innerHTML = newText;
        setTimeout(() => AdvanceScramble(original, newText, currentIndex, elementId), Math.floor(Math.random() * 60));
    }
    AdvanceScramble(original, "", 0, elementId);
}

function AnimateText(target) {
    var elems = document.getElementsByClassName(target);
    for (var i = 0; i < elems.length; i++) {
        AnimateElement(elems[i]);
    }
}
