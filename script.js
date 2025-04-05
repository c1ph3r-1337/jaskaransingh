// Global counter for unique window IDs
let windowCounter = 0;

// Map window types to titles and content templates
const windowTemplates = {
  terminal: { title: "Terminal", template: "terminal-content" },
  about: { title: "About Me", template: "about-content" },
  projects: { title: "Projects", template: "projects-content" },
  skills: { title: "Skills", template: "skills-content" },
  contact: { title: "Contact", template: "contact-content" },
  firefox: { title: "Firefox Browser", template: "firefox-content" }
};

// Minimum dimensions for windows
const minWidth = 300;
const minHeight = 200;

// Create a new window based on its type
function createWindow(type) {
  const container = document.getElementById("windows-container");
  const template = document.getElementById("window-template");
  const newWin = template.content.firstElementChild.cloneNode(true);

  // Set unique id and type
  newWin.dataset.window = type;
  newWin.id = `window-${windowCounter++}`;

  // Set title text
  const titleElem = newWin.querySelector(".window-title");
  titleElem.textContent = windowTemplates[type]?.title || type;

  // Load content from corresponding template
  const contentElem = newWin.querySelector(".window-content");
  if (windowTemplates[type]?.template) {
    const contentTemplate = document.getElementById(windowTemplates[type].template);
    if (contentTemplate) {
      contentElem.appendChild(contentTemplate.content.cloneNode(true));
    } else {
      contentElem.textContent = "Content not found.";
    }
  } else {
    contentElem.textContent = "No content available.";
  }

  // Append to container and set initial position and size
  container.appendChild(newWin);
  newWin.style.left = "100px";
  newWin.style.top = "100px";
  newWin.style.width = minWidth + "px";
  newWin.style.height = minHeight + "px";

  // Bring to front on mousedown
  newWin.addEventListener("mousedown", () => bringToFront(newWin));

  // Enable dragging, resizing, and window controls
  makeDraggable(newWin);
  makeResizable(newWin);
  initWindowControls(newWin);

  // If a terminal window, initialize its command handling
  if (type === "terminal") {
    initializeTerminalCommands(newWin);
  }
}

// Set window's z-index to bring it to the front
function bringToFront(win) {
  const allWindows = document.querySelectorAll(".window");
  allWindows.forEach(w => w.style.zIndex = "1");
  win.style.zIndex = "100";
}

// Make window draggable via its titlebar
function makeDraggable(win) {
  const titlebar = win.querySelector(".window-titlebar");
  titlebar.addEventListener("mousedown", (e) => {
    e.preventDefault();
    bringToFront(win);
    const offsetX = e.clientX - win.offsetLeft;
    const offsetY = e.clientY - win.offsetTop;

    function onMouseMove(e) {
      win.style.left = (e.clientX - offsetX) + "px";
      win.style.top = (e.clientY - offsetY) + "px";
    }
    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });
}

// Make window resizable using its bottom-right resize handle
function makeResizable(win) {
  const resizeHandle = win.querySelector(".window-resize-handle");
  if (!resizeHandle) return;
  resizeHandle.addEventListener("mousedown", (e) => {
    e.preventDefault();
    bringToFront(win);
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = parseInt(window.getComputedStyle(win).width, 10);
    const startHeight = parseInt(window.getComputedStyle(win).height, 10);
    
    function doDrag(e) {
      let newWidth = startWidth + (e.clientX - startX);
      let newHeight = startHeight + (e.clientY - startY);
      if (newWidth < minWidth) newWidth = minWidth;
      if (newHeight < minHeight) newHeight = minHeight;
      win.style.width = newWidth + "px";
      win.style.height = newHeight + "px";
    }
    function stopDrag() {
      document.removeEventListener("mousemove", doDrag);
      document.removeEventListener("mouseup", stopDrag);
    }
    document.addEventListener("mousemove", doDrag);
    document.addEventListener("mouseup", stopDrag);
  });
}

// Initialize minimize and close buttons for a window
function initWindowControls(win) {
  const minimizeBtn = win.querySelector(".window-minimize");
  const closeBtn = win.querySelector(".window-close");
  const contentArea = win.querySelector(".window-content");

  // Minimize toggles the content area visibility and adjusts height
  minimizeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (contentArea.style.display === "none") {
      contentArea.style.display = "block";
      win.style.height = "";
    } else {
      contentArea.style.display = "none";
      win.style.height = win.querySelector(".window-titlebar").offsetHeight + "px";
    }
  });

  // Close button removes the window from the DOM
  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    win.remove();
  });
}

// Terminal command initialization: listen for Enter key on input
function initializeTerminalCommands(win) {
  const terminalOutput = win.querySelector("#terminal-output");
  const terminalInput = win.querySelector("#terminal-input");
  
  terminalInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const command = terminalInput.value.trim();
      // Echo the command to terminal output
      addTerminalLine(terminalOutput, command, true);
      // Process the command and output result
      processCommand(command, terminalOutput);
      terminalInput.value = "";
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
  });
}

// Add a new line to terminal output (command or response)
function addTerminalLine(outputElem, text, isCommand = false) {
  const line = document.createElement("div");
  line.classList.add("terminal-line");
  if (isCommand) line.classList.add("command");
  line.textContent = text;
  outputElem.appendChild(line);
}

// Process the terminal command and output appropriate response
function processCommand(cmd, outputElem) {
  switch (cmd.toLowerCase()) {
    case "help":
      addTerminalLine(outputElem, "Available commands: help, clear, about, projects, skills, contact");
      break;
    case "clear":
      outputElem.innerHTML = "";
      break;
    case "about":
      addTerminalLine(outputElem, "I'm a full-stack developer passionate about modern web technologies.");
      break;
    case "projects":
      addTerminalLine(outputElem, "Click the 'Projects' icon on the desktop to view my projects!");
      break;
    case "skills":
      addTerminalLine(outputElem, "I work with JavaScript, React, Node.js, and more!");
      break;
    case "contact":
      addTerminalLine(outputElem, "You can reach me via email or through my social links in the Contact window.");
      break;
    default:
      if (cmd) {
        addTerminalLine(outputElem, `Unknown command: ${cmd}. Type 'help' for a list of commands.`);
      }
      break;
  }
}

// Attach click listeners to all elements with a data-window attribute (desktop, dock, dropdown)
function attachIconListeners() {
  const icons = document.querySelectorAll("[data-window]");
  icons.forEach(icon => {
    icon.addEventListener("click", (e) => {
      e.stopPropagation();
      const type = icon.dataset.window;
      createWindow(type);
    });
  });
}

// Handle dropdown menus for the top panel
function attachDropdownListeners() {
  const dropdownBtns = document.querySelectorAll(".dropdown-btn");
  dropdownBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      const menu = btn.nextElementSibling;
      menu.classList.toggle("show");
      // Close other dropdown menus
      document.querySelectorAll(".dropdown-content.show").forEach(m => {
        if (m !== menu) m.classList.remove("show");
      });
      e.stopPropagation();
    });
  });
  document.addEventListener("click", () => {
    document.querySelectorAll(".dropdown-content.show").forEach(m => m.classList.remove("show"));
  });
}

// Initialize event listeners once the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  attachIconListeners();
  attachDropdownListeners();
  // Refresh Lucide icons to ensure they render
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
});
