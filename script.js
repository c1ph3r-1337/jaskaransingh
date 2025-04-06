document.addEventListener('DOMContentLoaded', function() {
  // Initialize Lucide icons
  const lucide = window.lucide;
  lucide.createIcons();
  
  // State management
  const state = {
      windows: {
          terminal: { open: false, minimized: false, zIndex: 1 },
          about: { open: false, minimized: false, zIndex: 1 },
          projects: { open: false, minimized: false, zIndex: 1 },
          skills: { open: false, minimized: false, zIndex: 1 },
          contact: { open: false, minimized: false, zIndex: 1 }
      },
      activeWindow: null,
      nextZIndex: 2,
      windowPositions: {
          terminal: { x: 870, y: 400 },
          about: { x: 150, y: 120 },
          projects: { x: 200, y: 150 },
          skills: { x: 250, y: 180 },
          contact: { x: 300, y: 200 }
      },
      windowSizes: {
          terminal: { width: 800, height: 450 }, // 16:9 aspect ratio
          about: { width: 800, height: 450 },    // 16:9 aspect ratio
          projects: { width: 800, height: 450 }, // 16:9 aspect ratio
          skills: { width: 640, height: 360 },   // 16:9 aspect ratio
          contact: { width: 640, height: 360 }   // 16:9 aspect ratio
      },
      skillsData: {
          frontend: [
              { name: "HTML/CSS", level: 90 },
              { name: "JavaScript", level: 85 },
              { name: "TypeScript", level: 80 },
              { name: "React", level: 85 },
              { name: "Next.js", level: 80 },
              { name: "Tailwind CSS", level: 90 }
          ],
          backend: [
              { name: "Node.js", level: 80 },
              { name: "Express", level: 75 },
              { name: "Python", level: 70 },
              { name: "Django", level: 65 },
              { name: "GraphQL", level: 70 }
          ],
          database: [
              { name: "MongoDB", level: 80 },
              { name: "PostgreSQL", level: 75 },
              { name: "MySQL", level: 70 },
              { name: "Firebase", level: 75 },
              { name: "Redis", level: 65 }
          ],
          devops: [
              { name: "Git", level: 85 },
              { name: "Docker", level: 70 },
              { name: "CI/CD", level: 65 },
              { name: "AWS", level: 60 },
              { name: "Linux", level: 75 }
          ]
      },
      terminalHistory: [
          { type: 'output', content: '' }
      ],
      commandHistory: [],
      historyIndex: -1
  };
  
  // DOM Elements
  const desktop = document.getElementById('desktop');
  const windowsContainer = document.getElementById('windows-container');
  const dock = document.getElementById('dock');
  const contextMenu = document.getElementById('context-menu');
  const datetimeEl = document.getElementById('datetime');
  const desktopClockEl = document.getElementById('desktop-clock');
  
  // Top Panel Dropdowns
  const appsBtn = document.getElementById('apps-btn');
  const placesBtn = document.getElementById('places-btn');
  const appsMenu = document.getElementById('apps-menu');
  const placesMenu = document.getElementById('places-menu');
  
  // Update date and time
  function updateDateTime() {
      const now = new Date();
      
      // Format for top panel
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[now.getMonth()];
      const day = now.getDate();
      let hours = now.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minutes = now.getMinutes().toString().padStart(2, '0');
      datetimeEl.textContent = `${month} ${day} ${hours}:${minutes} ${ampm}`;
      
      // Format for desktop clock
      const seconds = now.getSeconds().toString().padStart(2, '0');
      const formattedDate = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;
      desktopClockEl.textContent = `${hours}:${minutes}:${seconds} ${ampm} | ${formattedDate}`;
  }
  
  // Initialize and update clock
  updateDateTime();
  setInterval(updateDateTime, 1000);
  
  // Window Management Functions
  function openWindow(windowName) {
      if (!state.windows[windowName]) return;
      
      state.windows[windowName].open = true;
      state.windows[windowName].minimized = false;
      state.windows[windowName].zIndex = state.nextZIndex++;
      state.activeWindow = windowName;
      
      renderWindows();
      updateDockIcons();
  }
  
  function closeWindow(windowName) {
      if (!state.windows[windowName]) return;
      
      state.windows[windowName].open = false;
      
      if (state.activeWindow === windowName) {
          state.activeWindow = null;
      }
      
      renderWindows();
      updateDockIcons();
  }
  
  function minimizeWindow(windowName) {
      if (!state.windows[windowName]) return;
      
      state.windows[windowName].minimized = true;
      
      if (state.activeWindow === windowName) {
          state.activeWindow = null;
      }
      
      renderWindows();
      updateDockIcons();
  }
  
  function restoreWindow(windowName) {
      if (!state.windows[windowName]) return;
      
      state.windows[windowName].minimized = false;
      state.windows[windowName].zIndex = state.nextZIndex++;
      state.activeWindow = windowName;
      
      renderWindows();
      updateDockIcons();
  }
  
  function focusWindow(windowName) {
      if (!state.windows[windowName] || !state.windows[windowName].open || state.windows[windowName].minimized) return;
      
      state.windows[windowName].zIndex = state.nextZIndex++;
      state.activeWindow = windowName;
      
      // Update active class on all windows
      const windows = windowsContainer.querySelectorAll('.window');
      windows.forEach(win => {
          if (win.dataset.window === windowName) {
              win.classList.add('active');
          } else {
              win.classList.remove('active');
          }
      });
  }
  
  // Render all windows
  function renderWindows() {
      // Clear existing windows
      windowsContainer.innerHTML = '';
      
      // Create and append each open window
      Object.keys(state.windows).forEach(windowName => {
          const windowState = state.windows[windowName];
          
          if (windowState.open && !windowState.minimized) {
              const windowEl = createWindowElement(windowName);
              windowsContainer.appendChild(windowEl);
          }
      });
  }
  
  // Create a window element
  function createWindowElement(windowName) {
      const template = document.getElementById('window-template');
      const windowEl = template.content.cloneNode(true).querySelector('.window');
      
      // Set window attributes
      windowEl.dataset.window = windowName;
      windowEl.style.left = `${state.windowPositions[windowName].x}px`;
      windowEl.style.top = `${state.windowPositions[windowName].y}px`;
      windowEl.style.width = `${state.windowSizes[windowName].width}px`;
      windowEl.style.height = `${state.windowSizes[windowName].height}px`;
      windowEl.style.zIndex = state.windows[windowName].zIndex;
      
      if (state.activeWindow === windowName) {
          windowEl.classList.add('active');
      }
      
      // Set window title
      const titleEl = windowEl.querySelector('.window-title');
      switch (windowName) {
          case 'terminal': titleEl.textContent = 'Terminal'; break;
          case 'about': titleEl.textContent = 'About Me'; break;
          case 'projects': titleEl.textContent = 'Projects'; break;
          case 'skills': titleEl.textContent = 'Skills'; break;
          case 'contact': titleEl.textContent = 'Contact'; break;
      }
      
      // Add window content
      const contentEl = windowEl.querySelector('.window-content');
      const contentTemplate = document.getElementById(`${windowName}-content`);
      if (contentTemplate) {
          contentEl.appendChild(contentTemplate.content.cloneNode(true));
      }
      
      // Initialize specific window content
      if (windowName === 'terminal') {
          initializeTerminal(windowEl);
      } else if (windowName === 'skills') {
          initializeSkills(windowEl);
      } else if (windowName === 'contact') {
          initializeContactForm(windowEl);
      } else if (windowName === 'projects') {
          initializeProjects(windowEl);
      }
      
      // Add event listeners
      setupWindowEventListeners(windowEl, windowName);
      
      return windowEl;
  }
  
  // Setup window event listeners
  function setupWindowEventListeners(windowEl, windowName) {
      const titleBar = windowEl.querySelector('.window-titlebar');
      const closeBtn = windowEl.querySelector('.window-close');
      const minimizeBtn = windowEl.querySelector('.window-minimize');
      const resizeHandle = windowEl.querySelector('.window-resize-handle');
      
      // Focus window on click
      windowEl.addEventListener('mousedown', () => {
          focusWindow(windowName);
      });
      
      // Close button
      closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          closeWindow(windowName);
      });
      
      // Minimize button
      minimizeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          minimizeWindow(windowName);
      });
      
      // Dragging
      let isDragging = false;
      let dragOffsetX, dragOffsetY;
      
      titleBar.addEventListener('mousedown', (e) => {
          // Only initiate drag if not clicking on window controls
          if (e.target.closest('.window-controls')) {
              return;
          }
          
          isDragging = true;
          dragOffsetX = e.clientX - windowEl.offsetLeft;
          dragOffsetY = e.clientY - windowEl.offsetTop;
          
          // Focus window when starting to drag
          focusWindow(windowName);
          
          // Prevent text selection during drag
          e.preventDefault();
          
          // Add dragging class for visual feedback
          windowEl.classList.add('dragging');
      });
      
      // Resizing
      let isResizing = false;
      let initialWidth, initialHeight, initialX, initialY;
      
      resizeHandle.addEventListener('mousedown', (e) => {
          isResizing = true;
          initialWidth = windowEl.offsetWidth;
          initialHeight = windowEl.offsetHeight;
          initialX = e.clientX;
          initialY = e.clientY;
          
          // Focus window when starting to resize
          focusWindow(windowName);
          
          // Prevent text selection during resize
          e.preventDefault();
          
          // Add resizing class for visual feedback
          windowEl.classList.add('resizing');
      });
      
      // Global mouse events for drag and resize
      document.addEventListener('mousemove', (e) => {
          if (isDragging) {
              const newX = Math.max(0, Math.min(e.clientX - dragOffsetX, window.innerWidth - windowEl.offsetWidth));
              const newY = Math.max(32, Math.min(e.clientY - dragOffsetY, window.innerHeight - windowEl.offsetHeight));
              
              windowEl.style.left = `${newX}px`;
              windowEl.style.top = `${newY}px`;
              
              // Update stored position
              state.windowPositions[windowName] = { x: newX, y: newY };
          }
          
          if (isResizing) {
              // Calculate new width and height
              let newWidth = initialWidth + (e.clientX - initialX);
              
              // Maintain 16:9 aspect ratio
              let newHeight = Math.round(newWidth / 16 * 9);
              
              // Enforce minimum size and keep within viewport
              const minWidth = 320;
              const minHeight = 180;
              
              newWidth = Math.max(minWidth, Math.min(newWidth, window.innerWidth - windowEl.offsetLeft));
              newHeight = Math.max(minHeight, Math.min(newHeight, window.innerHeight - windowEl.offsetTop));
              
              // Adjust width to maintain aspect ratio if height is constrained
              if (newHeight === window.innerHeight - windowEl.offsetTop) {
                  newWidth = Math.round(newHeight / 9 * 16);
              }
              
              windowEl.style.width = `${newWidth}px`;
              windowEl.style.height = `${newHeight}px`;
              
              // Update stored size
              state.windowSizes[windowName] = { width: newWidth, height: newHeight };
              
              // Trigger resize event for content adjustment
              const resizeEvent = new Event('windowresize');
              windowEl.dispatchEvent(resizeEvent);
          }
      });
      
      document.addEventListener('mouseup', () => {
          if (isDragging) {
              windowEl.classList.remove('dragging');
          }
          
          if (isResizing) {
              windowEl.classList.remove('resizing');
          }
          
          isDragging = false;
          isResizing = false;
      });
      
      // Handle window resize event for content adjustment
      windowEl.addEventListener('windowresize', () => {
          // Adjust content based on window type
          if (windowName === 'terminal') {
              adjustTerminalSize(windowEl);
          }
      });
  }
  
  // Adjust terminal size when window is resized
  function adjustTerminalSize(windowEl) {
      const outputEl = windowEl.querySelector('.terminal-output');
      const contentEl = windowEl.querySelector('.window-content');
      
      if (outputEl && contentEl) {
          // Calculate available height for terminal output
          const inputLineHeight = windowEl.querySelector('.terminal-input-line').offsetHeight;
          const contentHeight = contentEl.offsetHeight;
          
          // Set output height to fill available space
          outputEl.style.height = `${contentHeight - inputLineHeight - 16}px`;
          
          // Scroll to bottom
          outputEl.scrollTop = outputEl.scrollHeight;
      }
  }
  
  // Update dock icons to reflect window states
  function updateDockIcons() {
      const dockIcons = dock.querySelectorAll('.dock-icon');
      
      dockIcons.forEach(icon => {
          const windowName = icon.dataset.window;
          
          if (state.windows[windowName].open) {
              icon.classList.add('active');
          } else {
              icon.classList.remove('active');
          }
      });
  }
  
  // Initialize terminal functionality
  function initializeTerminal(windowEl) {
    const outputEl = windowEl.querySelector('.terminal-output');
  
    // Render the initial terminal content
    renderTerminalHistory(outputEl);
    // Append a new input line to start accepting commands
    appendTerminalInputLine(outputEl);
    
    // Focus the newly added input field
    outputEl.lastElementChild.querySelector('.terminal-input').focus();
  }
  
  // Instead of a persistent input element, create and append an input line dynamically.
  function appendTerminalInputLine(outputEl) {
    // Create a container for the input line
    const inputLineEl = document.createElement('div');
    inputLineEl.className = 'terminal-input-line';
    
    // Create the prompt span
    const promptEl = document.createElement('span');
    promptEl.className = 'terminal-prompt';
    promptEl.textContent = 'visitor@portfolio:~$ ';
    promptEl.style.fontSize = '16px'; 

    // Create the input field
    const inputEl = document.createElement('input');
    inputEl.type = 'text';
    inputEl.className = 'terminal-input';
    
    // Append prompt and input to the input line container
    inputLineEl.appendChild(promptEl);
    inputLineEl.appendChild(inputEl);
    outputEl.appendChild(inputLineEl);
    
    // Add event listener for handling input
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && inputEl.value.trim()) {
        // Get the command text and remove the input line from the DOM
        const command = inputEl.value.trim();
        // Replace the current input line with a plain text version (to lock the command)
        const commandEl = document.createElement('div');
        commandEl.className = 'terminal-line command';
        commandEl.textContent = promptEl.textContent + command;
        outputEl.replaceChild(commandEl, inputLineEl);
        
        // Execute the command and capture its output
        const output = executeCommand(command);
        // Append the command output
        if (output !== 'CLEAR') {
          appendTerminalOutput(outputEl, output);
        } else {
          // For "clear", remove all terminal history
          outputEl.innerHTML = '';
        }
        
        // Append a new input line for the next command
        appendTerminalInputLine(outputEl);
        
        // Scroll to the bottom of the terminal output
        outputEl.scrollTop = outputEl.scrollHeight;
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        // (Optional: Implement command history navigation here)
      }
      // Add other key-handling as needed (like Tab completion)
    });
  }
  
  // Append output text to the terminal
  function appendTerminalOutput(outputEl, outputText) {
    const outputLineEl = document.createElement('div');
    outputLineEl.className = 'terminal-line';
    
    // Convert newline characters into <br> and preserve spaces
    outputLineEl.innerHTML = outputText
      .split('\n')
      .map(line => line.replace(/ /g, '&nbsp;'))
      .join('<br>');
    
    outputEl.appendChild(outputLineEl);
  }
  
  // Render terminal history if needed (this could load past commands if you want persistence)
  function renderTerminalHistory(outputEl) {
    // For example, you could loop through state.terminalHistory if you want to reload previous commands
    outputEl.innerHTML = ''; // Start with a clean slate
    state.terminalHistory.forEach(item => {
      const lineEl = document.createElement('div');
      lineEl.className = 'terminal-line' + (item.type === 'command' ? ' command' : '');
      lineEl.innerHTML = item.content.split('\n').map(line => line.replace(/ /g, '&nbsp;')).join('<br>');
      outputEl.appendChild(lineEl);
    });
  }
  
  // Modify executeCommand as needed (this example remains similar to your original implementation)
  function executeCommand(command) {
    const lowerCommand = command.toLowerCase().trim();
  
    if (lowerCommand === 'help') {
      return `Available commands:
  - about: Display information about me
  - projects: View my projects
  - skills: List my technical skills
  - contact: Show contact information
  - clear: Clear the terminal
  - open [window]: Open a specific window (terminal, about, projects, skills, contact)
  - close [window]: Close a specific window
  - minimize [window]: Minimize a specific window
  - restore [window]: Restore a minimized window
  - ls: List available sections
  - date: Display current date and time
  - whoami: Display user information
  - echo [text]: Display text
  - pwd: Print working directory`;
    } else if (lowerCommand === 'about') {
      openWindow('about');
      return 'Opening about window...';
    } else if (lowerCommand === 'projects') {
      openWindow('projects');
      return 'Opening projects window...';
    } else if (lowerCommand === 'skills') {
      openWindow('skills');
      return 'Opening skills window...';
    } else if (lowerCommand === 'contact') {
      openWindow('contact');
      return 'Opening contact window...';
    } else if (lowerCommand === 'clear') {
      return 'CLEAR';
    } else if (lowerCommand === 'ls') {
      return 'about\nprojects\nskills\ncontact';
    } else if (lowerCommand === 'date') {
      return new Date().toString();
    } else if (lowerCommand === 'whoami') {
      return 'visitor@portfolio';
    } else if (lowerCommand === 'pwd') {
      return '/home/visitor/portfolio';
    } else if (lowerCommand.startsWith('echo ')) {
      return command.substring(5);
    } else if (lowerCommand.startsWith('open ')) {
      const windowName = lowerCommand.split(' ')[1];
      if (state.windows[windowName]) {
        openWindow(windowName);
        return `Opening ${windowName} window...`;
      } else {
        return `Window '${windowName}' not found. Available windows: terminal, about, projects, skills, contact`;
      }
    } else if (lowerCommand.startsWith('close ')) {
      const windowName = lowerCommand.split(' ')[1];
      if (state.windows[windowName]) {
        closeWindow(windowName);
        return `Closing ${windowName} window...`;
      } else {
        return `Window '${windowName}' not found. Available windows: terminal, about, projects, skills, contact`;
      }
    } else if (lowerCommand.startsWith('minimize ')) {
      const windowName = lowerCommand.split(' ')[1];
      if (state.windows[windowName]) {
        minimizeWindow(windowName);
        return `Minimizing ${windowName} window...`;
      } else {
        return `Window '${windowName}' not found. Available windows: terminal, about, projects, skills, contact`;
      }
    } else if (lowerCommand.startsWith('restore ')) {
      const windowName = lowerCommand.split(' ')[1];
      if (state.windows[windowName] && state.windows[windowName].minimized) {
        restoreWindow(windowName);
        return `Restoring ${windowName} window...`;
      } else if (!state.windows[windowName]) {
        return `Window '${windowName}' not found. Available windows: terminal, about, projects, skills, contact`;
      } else {
        return `Window '${windowName}' is not minimized.`;
      }
    } else {
      return `Command not found: ${command}. Type 'help' for available commands.`;
    }
  }
  
  // Initialize skills window
  function initializeSkills(windowEl) {
      const categoryBtns = windowEl.querySelectorAll('.category-btn');
      const skillsContentArea = windowEl.querySelector('#skills-content-area');
      
      categoryBtns.forEach(btn => {
          btn.addEventListener('click', () => {
              // Update active button
              categoryBtns.forEach(b => b.classList.remove('active'));
              btn.classList.add('active');
              
              // Get category and update content
              const category = btn.dataset.category;
              updateSkillsContent(category, skillsContentArea);
          });
      });
      
      // Initialize with first category
      updateSkillsContent('frontend', skillsContentArea);
  }
  
  // Initialize projects window
  function initializeProjects(windowEl) {
      const projectCards = windowEl.querySelectorAll('.project-card');
      
      projectCards.forEach(card => {
          card.addEventListener('click', () => {
              // Remove active class from all cards
              projectCards.forEach(c => c.classList.remove('active-project'));
              
              // Add active class to clicked card
              card.classList.add('active-project');
          });
      });
  }
  
  // Update skills content based on selected category
  function updateSkillsContent(category, contentArea) {
      const skills = state.skillsData[category];
      const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
      
      // Update heading
      const heading = contentArea.querySelector('.section-heading');
      heading.textContent = `${categoryTitle} Skills`;
      
      // Clear existing skills
      const existingSkills = contentArea.querySelectorAll('.skill-item');
      existingSkills.forEach(item => item.remove());
      
      // Add new skills
      skills.forEach(skill => {
          const skillItem = document.createElement('div');
          skillItem.className = 'skill-item';
          skillItem.innerHTML = `
              <div class="skill-header">
                  <span class="skill-name">${skill.name}</span>
                  <span class="skill-level">${skill.level}%</span>
              </div>
              <div class="skill-bar">
                  <div class="skill-progress" style="width: ${skill.level}%"></div>
              </div>
          `;
          contentArea.appendChild(skillItem);
      });
  }
  
  // Initialize contact form
  function initializeContactForm(windowEl) {
      const form = windowEl.querySelector('#contact-form');
      const successMessage = windowEl.querySelector('#form-success');
      
      if (form) {
          form.addEventListener('submit', (e) => {
              e.preventDefault();
              
              // Simulate form submission
              form.style.display = 'none';
              successMessage.style.display = 'block';
              
              // Reset form after delay
              setTimeout(() => {
                  form.reset();
                  form.style.display = 'block';
                  successMessage.style.display = 'none';
              }, 3000);
          });
      }
  }
  
  // Context Menu
  desktop.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      
      // Position context menu
      contextMenu.style.display = 'block';
      contextMenu.style.left = `${e.clientX}px`;
      contextMenu.style.top = `${e.clientY}px`;
      
      // Ensure menu stays within viewport
      const rect = contextMenu.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
          contextMenu.style.left = `${window.innerWidth - rect.width}px`;
      }
      if (rect.bottom > window.innerHeight) {
          contextMenu.style.top = `${window.innerHeight - rect.height}px`;
      }
  });
  
  // Hide context menu on click outside
  document.addEventListener('click', () => {
      contextMenu.style.display = 'none';
  });
  
  // Context menu buttons
  const contextMenuButtons = contextMenu.querySelectorAll('button[data-window]');
  contextMenuButtons.forEach(button => {
      button.addEventListener('click', () => {
          const windowName = button.dataset.window;
          openWindow(windowName);
      });
  });
  
  // Refresh button
  document.getElementById('refresh-btn').addEventListener('click', () => {
      location.reload();
  });
  
  // Desktop icons
  const desktopIcons = document.querySelectorAll('.desktop-icon');
  desktopIcons.forEach(icon => {
      icon.addEventListener('click', () => {
          const windowName = icon.dataset.window;
          openWindow(windowName);
      });
  });
  
  // Dock icons
  const dockIcons = document.querySelectorAll('.dock-icon');
  dockIcons.forEach(icon => {
      icon.addEventListener('click', () => {
          const windowName = icon.dataset.window;
          
          if (state.windows[windowName].open) {
              if (state.windows[windowName].minimized) {
                  restoreWindow(windowName);
              } else {
                  minimizeWindow(windowName);
              }
          } else {
              openWindow(windowName);
          }
      });
  });
  
  // Make dock draggable
  const dockHandle = document.querySelector('.dock-handle');
  let isDockDragging = false;
  let dockDragOffsetX, dockDragOffsetY;
  
  dockHandle.addEventListener('mousedown', (e) => {
      isDockDragging = true;
      dockDragOffsetX = e.clientX - dock.offsetLeft;
      dockDragOffsetY = e.clientY - dock.offsetTop;
      
      // Prevent text selection during drag
      e.preventDefault();
      
      // Add dragging class for visual feedback
      dock.classList.add('dragging');
  });
  
  document.addEventListener('mousemove', (e) => {
      if (isDockDragging) {
          // Keep dock within viewport
          const newLeft = Math.max(0, Math.min(e.clientX - dockDragOffsetX, window.innerWidth - dock.offsetWidth));
          const newTop = Math.max(32, Math.min(e.clientY - dockDragOffsetY, window.innerHeight - dock.offsetHeight));
          
          dock.style.left = `${newLeft}px`;
          dock.style.top = `${newTop}px`;
          dock.style.transform = 'none'; // Remove the default centering
      }
  });
  
  document.addEventListener('mouseup', () => {
      if (isDockDragging) {
          dock.classList.remove('dragging');
      }
      isDockDragging = false;
  });
  
  // Top panel dropdown menus
  appsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      appsMenu.classList.toggle('show');
      placesMenu.classList.remove('show');
      
      appsBtn.classList.toggle('active');
      placesBtn.classList.remove('active');
  });
  
  placesBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      placesMenu.classList.toggle('show');
      appsMenu.classList.remove('show');
      
      placesBtn.classList.toggle('active');
      appsBtn.classList.remove('active');
  });
  
  // Close dropdowns when clicking elsewhere
  document.addEventListener('click', () => {
      appsMenu.classList.remove('show');
      placesMenu.classList.remove('show');
      appsBtn.classList.remove('active');
      placesBtn.classList.remove('active');
  });
  
  // Handle window resize
  window.addEventListener('resize', () => {
      // Ensure windows stay within viewport after browser resize
      Object.keys(state.windows).forEach(windowName => {
          if (state.windows[windowName].open && !state.windows[windowName].minimized) {
              const windowEl = document.querySelector(`.window[data-window="${windowName}"]`);
              
              if (windowEl) {
                  // Get current position and size
                  let { x, y } = state.windowPositions[windowName];
                  let { width, height } = state.windowSizes[windowName];
                  
                  // Adjust if window is outside viewport
                  if (x + width > window.innerWidth) {
                      x = Math.max(0, window.innerWidth - width);
                  }
                  
                  if (y + height > window.innerHeight) {
                      y = Math.max(32, window.innerHeight - height);
                  }
                  
                  // Update position
                  windowEl.style.left = `${x}px`;
                  windowEl.style.top = `${y}px`;
                  
                  // Update stored position
                  state.windowPositions[windowName] = { x, y };
                  
                  // Trigger resize event for content adjustment
                  const resizeEvent = new Event('windowresize');
                  windowEl.dispatchEvent(resizeEvent);
              }
          }
      });
  });
  
  // Handle keyboard shortcuts
  document.addEventListener('keydown', (e) => {
      // Alt+Tab to cycle through windows
      if (e.altKey && e.key === 'Tab') {
          e.preventDefault();
          
          const openWindows = Object.keys(state.windows).filter(
              name => state.windows[name].open && !state.windows[name].minimized
          );
          
          if (openWindows.length > 0) {
              // Find current active window index
              const currentIndex = openWindows.indexOf(state.activeWindow);
              
              // Calculate next window index (cycle through)
              const nextIndex = (currentIndex + 1) % openWindows.length;
              
              // Focus next window
              focusWindow(openWindows[nextIndex]);
          }
      }
      
      // Ctrl+` to toggle terminal
      if (e.ctrlKey && e.key === '`') {
          e.preventDefault();
          
          if (state.windows.terminal.open) {
              if (state.windows.terminal.minimized) {
                  restoreWindow('terminal');
              } else {
                  minimizeWindow('terminal');
              }
          } else {
              openWindow('terminal');
          }
      }
  });
  
  // Initialize with terminal open
  openWindow('terminal');
});