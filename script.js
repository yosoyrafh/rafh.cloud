const profile = {
  name: "Rafael A. Flores",
  role: "Linux Enthusiast and Creative Technologist",
  location: "Alexandria, Virginia",
  email: "yosoyrafh@rafh.cloud",
  github: "https://github.com/",
  linkedin: "https://linkedin.com/",
  bio: "I enjoy building monitoring tools that make life a little bit easier.",
  skills: ["checkmk", "Skylar One", "Python", "Ansible", "Proxmox"],
  projects: [
    { name: "Project One", description: "A small description of a project you are proud of.", stack: "React · TypeScript" },
    { name: "Project Two", description: "Another project, experiment, or open-source contribution.", stack: "Node.js · API" },
    { name: "Project Three", description: "A recent collaboration or idea brought to life.", stack: "JavaScript · CSS" },
  ],
};

const files = {
  "about.txt": () => [
    { text: profile.name, className: "section-title" },
    { text: profile.role, className: "muted" },
    { text: "" },
    { text: profile.bio },
    { text: "" },
    { text: `📍  ${profile.location}` },
    { text: `✉   ${profile.email}` },
  ],
  "skills.txt": () => [
    { text: "TOOLS I REACH FOR", className: "section-title" },
    { text: "Red Hat Certified System Administrator - RHEL 10", className: "muted" },
    { text: profile.skills.join("   ·   ") },
  ],
  "projects.txt": () => [
    { text: "SELECTED WORK", className: "section-title" },
    ...profile.projects.flatMap((project) => [
      { text: `▸ ${project.name}`, className: "success" },
      { text: `  ${project.description}` },
      { text: `  ${project.stack}`, className: "muted" },
      { text: "" },
    ]),
  ],
  "contact.txt": () => [
    { text: "Let's build!", className: "section-title" },
    { text: `Email: ${profile.email}` },
    { text: `GitHub: ${profile.github}` },
    { text: `LinkedIn: ${profile.linkedin}` },
  ],
  ".hello": () => [
    { text: "You found the hidden file. Nice work." },
    { text: "Hidden files in Linux start with a dot and are used to store configuration settings, application data, and system metadata that should not clutter regular directory listings or be accidentally modified." },
  ],
};

const output = document.querySelector("#output");
const form = document.querySelector("#command-form");
const input = document.querySelector("#command-input");
const history = [];
let historyIndex = 0;
let currentDirectory = "~";
let welcomeShown = false;

function updatePrompt() {
  document.querySelector(".prompt-path").textContent = `:${currentDirectory}`;
}

function updateUtcClock() {
  const now = new Date();
  const clock = document.querySelector("#utc-clock");
  clock.dateTime = now.toISOString();
  clock.textContent = `${clock.dateTime.slice(0, 16).replace("T", " ")} UTC`;
}

function addLine(text = "", className = "") {
  const paragraph = document.createElement("p");
  paragraph.className = className;
  paragraph.textContent = text;
  output.append(paragraph);
  output.scrollTop = output.scrollHeight;
}

function addWelcome() {
  if (welcomeShown) return;
  welcomeShown = true;
  addLine("Welcome to rafh.cloud v1.0 - Simulated Terminal", "welcome-title");
  addLine("Explore my website using CLI commands.", "welcome-subtitle");
  addLine("");
  addLine("Start here:  ls -a     to list files", "muted");
  addLine("            'cat about.txt' to learn about me", "muted");
  addLine("            'help' to see available commands", "muted");
  addLine("            Type 'clear' to clear the contents of the terminal", "muted");
  addLine("Press Tab to autocomplete commands, files, and directories.", "muted");
  addLine("");
}

function listFiles(showHidden = false) {
  const entries = currentDirectory === "~"
    ? [
        { name: "about.txt", type: "file" },
        { name: "projects/", type: "directory" },
        { name: "skills.txt", type: "file" },
        { name: "contact.txt", type: "file" },
      ]
    : currentDirectory === "~/projects"
      ? [{ name: "projects.txt", type: "file" }]
      : [{ name: "README.txt", type: "file" }];
  if (showHidden && currentDirectory === "~") entries.push({ name: ".hello", type: "file" });
  const container = document.createElement("div");
  container.className = "file-list";
  for (const entry of entries) {
    const item = document.createElement("span");
    item.className = entry.type;
    item.textContent = entry.name;
    container.append(item);
  }
  output.append(container);
}

function showFile(name) {
  const content = files[name];
  if (!content) {
    addLine(`cat: ${name}: No such file or directory`, "warning");
    return;
  }
  for (const line of content()) addLine(line.text, line.className ?? "");
}

function showHelp() {
  addLine("COMMANDS", "section-title");
  addLine("  help               Show this list");
  addLine("  ls [-a]            List files (use -a to show hidden files)");
  addLine("  ll                 Alias for ls -a");
  addLine("  cd [directory]     Explore projects/ or return with cd ~");
  addLine("  cat [file]         Read about.txt, skills.txt, projects.txt, contact.txt");
  addLine("  whoami             A quick introduction");
  addLine("  pwd                Print your current location");
  addLine("  history            Show recent commands");
  addLine("  clear              Clear the terminal");
  addLine("");
  addLine("Tip: use Tab to autocomplete; ↑ and ↓ revisit commands.", "muted");
}

function showProjects() {
  addLine("projects/", "directory");
  addLine("projects.txt", "file");
  addLine("");
  addLine("Run `cat projects.txt` to see selected work.", "muted");
}

function completionCandidates(value) {
  const argumentMatch = value.match(/^(\s*)(\S+)(\s+)(.*)$/s);
  if (!argumentMatch) {
    const prefix = value.trimStart().toLowerCase();
    return ["help", "ls", "ll", "cd", "cat", "whoami", "pwd", "history", "clear", "run", "exit"]
      .filter((command) => command.startsWith(prefix))
      .map((command) => ({ value: command, isDirectory: false }));
  }

  const [, , action, , argument] = argumentMatch;
  const prefix = argument.toLowerCase();
  if (action.toLowerCase() === "cat") {
    return Object.keys(files)
      .filter((name) => name.toLowerCase().startsWith(prefix))
      .map((name) => ({ value: name, isDirectory: false }));
  }
  if (action.toLowerCase() === "cd") {
    const directories = currentDirectory === "~"
      ? ["..", "~", "projects/"]
      : [".."];
    return directories
      .filter((directory) => directory.toLowerCase().startsWith(prefix))
      .map((directory) => ({ value: directory, isDirectory: true }));
  }
  return [];
}

function completeInput() {
  const value = input.value;
  const tokenStart = value.lastIndexOf(" ") + 1;
  const token = value.slice(tokenStart);
  const candidates = completionCandidates(value);
  const matches = candidates.filter((candidate) => candidate.value.toLowerCase().startsWith(token.toLowerCase()));
  if (!matches.length) return;

  let completion;
  if (matches.length === 1) {
    const match = matches[0];
    completion = match.value;
    if (!match.isDirectory || !match.value.endsWith("/")) completion += " ";
  } else {
    completion = matches
      .map((match) => match.value)
      .reduce((common, candidate) => {
        let length = 0;
        while (
          length < common.length
          && length < candidate.length
          && common[length].toLowerCase() === candidate[length].toLowerCase()
        ) length += 1;
        return common.slice(0, length);
      });
    if (completion.length <= token.length) {
      addLine(matches.map((match) => match.value).join("    "), "muted");
      return;
    }
  }

  input.value = value.slice(0, tokenStart) + completion;
  input.setSelectionRange(input.value.length, input.value.length);
}

function runCommand(rawCommand) {
  const command = rawCommand.trim();
  if (!command) return;
  history.push(command);
  historyIndex = history.length;
  addLine(`guest@rafh.cloud:${currentDirectory}$ ${command}`, "command-echo");

  let [action, ...args] = command.split(/\s+/);
  if (action.toLowerCase() === "ll") {
    action = "ls";
    args = ["-a", ...args];
  }
  const argument = args.join(" ");
  switch (action.toLowerCase()) {
    case "help":
      showHelp();
      break;
    case "ls":
      listFiles(args.some((option) => /^-[^-]*a/.test(option)));
      break;
    case "pwd":
      addLine(`/home/${profile.name.toLowerCase().replaceAll(" ", "-")}${currentDirectory === "~" ? "" : `/${currentDirectory.slice(2)}`}`);
      break;
    case "whoami":
      showFile("about.txt");
      break;
    case "cat":
      showFile(argument || "");
      break;
    case "cd":
      if (!argument || argument === "~" || argument === "..") {
        currentDirectory = argument === ".." && currentDirectory.startsWith("~/projects/")
          ? "~/projects"
          : "~";
        updatePrompt();
      } else if (argument === "projects" || argument === "projects/") {
        currentDirectory = "~/projects";
        updatePrompt();
        showProjects();
      } else {
        addLine(`cd: ${argument}: No such directory`, "warning");
      }
      break;
    case "history":
      history.forEach((entry, index) => addLine(`  ${index + 1}  ${entry}`));
      break;
    case "clear":
      output.replaceChildren();
      break;
    case "run":
      for (const name of Object.keys(files)) showFile(name);
      break;
    case "exit":
      addLine("There is no need to leave just yet — make yourself at home.", "muted");
      break;
    default:
      addLine(`${action}: command not found. Type "help" to see available commands.`, "warning");
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  addWelcome();
  runCommand(input.value);
  input.value = "";
});

document.querySelector(".quick-nav").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-command]");
  if (!button) return;
  input.value = button.dataset.command;
  form.requestSubmit();
  input.focus();
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Tab") {
    event.preventDefault();
    completeInput();
  }
  if (event.key === "ArrowUp") {
    event.preventDefault();
    historyIndex = Math.max(0, historyIndex - 1);
    input.value = history[historyIndex] ?? "";
  }
  if (event.key === "ArrowDown") {
    event.preventDefault();
    historyIndex = Math.min(history.length, historyIndex + 1);
    input.value = history[historyIndex] ?? "";
  }
});

document.querySelector(".console").addEventListener("click", () => input.focus());
updateUtcClock();
setInterval(updateUtcClock, 60_000);
addWelcome();
