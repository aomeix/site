let username = '';
let server = '';
let port = '';
let baseUrl = '';

const loginSection = document.getElementById('login-section');
const chatSection = document.getElementById('chat-section');
const loginForm = document.getElementById('login-form');
const loginButton = loginForm.querySelector('button[type="submit"]');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const chatBox = document.getElementById('chat-box');

function setLoginLoading(isLoading) {
  loginButton.disabled = isLoading;
  loginButton.textContent = isLoading ? 'Connecting...' : 'Go Chat!';
}

function handlePacket(packet) {
  const line = document.createElement('div');

  switch (packet.type) {
    case 'message':
      line.textContent = `<${packet.username}> ${packet.text}`;
      break;
    case 'join':
    case 'leave':
    case 'system':
      line.textContent = `--- ${packet.message} ---`;
      break;
    case 'error':
      line.textContent = `error: ${packet.message}`;
      break;
    default:
      line.textContent = JSON.stringify(packet);
  }
  chatBox.appendChild(line);
  chatBox.scrollTop = chatBox.scrollHeight;
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nameInput = document.getElementById('username');
  username = nameInput ? nameInput.value.trim() : '';

  server = document.getElementById('server').value.trim();
  port = document.getElementById('port').value.trim();
  if (!port || port === '443' || port === '80') {
    baseUrl = `https://${server}`;
  } else {
    baseUrl = `https://${server}:${port}`;
  }

  setLoginLoading(true);

try {
    const res = await fetch(`${baseUrl}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });

    const packets = await res.json();
    if (!res.ok) {
      const errMsg = packets.message || `Error ${res.status}`;
      alert(`Server error: ${errMsg}`);
      setLoginLoading(false);
      return;
    }

    if (Array.isArray(packets)) {
      packets.forEach(handlePacket);
    } else if (packets.type === 'error') {
      handlePacket(packets);
      setLoginLoading(false);
      return;
    }

    loginSection.style.display = 'none';
    chatSection.style.display = 'block';
    pollEvents();

  } catch (err) {
    alert('Unable to connect to server.');
    console.error(err);
    setLoginLoading(false);
  }
});


window.addEventListener('pagehide', () => {
  if (username && baseUrl) {
    navigator.sendBeacon(`${baseUrl}/leave`, JSON.stringify({ username }));
  }
});

async function pollEvents() {
  try {
    const res = await fetch(`${baseUrl}/events?username=${encodeURIComponent(username)}`);

    if (res.status === 200) {
      const packets = await res.json();
      if (Array.isArray(packets)) {
        packets.forEach(handlePacket);
      }
      pollEvents();
    } else if (res.status === 401 || res.status === 404) {
      const line = document.createElement('div');
      line.textContent = 'Disconnected.';
      chatBox.appendChild(line);
    } else {
      setTimeout(pollEvents, 3000);
    }
  } catch (err) {
    setTimeout(pollEvents, 3000);
  }
}

messageForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const text = messageInput.value.trim();
  if (text.length === 0) return;

  messageInput.value = '';

  try {
    const res = await fetch(`${baseUrl}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, message: text })
    });

    if (res.ok) {
      handlePacket({
        type: 'message',
        username: username,
        text: text
      });
    }
  } catch (err) {
    const line = document.createElement('div');
    line.textContent = 'unable to send message';
    chatBox.appendChild(line);
  }
});