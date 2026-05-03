// --- app.js (v2: Advanced Roles & Assignment) ---

// 1. Data Models
class Ticket {
  constructor(title, department, priority, description, createdBy, createdById) {
    this.id = 'TKT-' + Math.floor(1000 + Math.random() * 9000);
    this.title = title;
    this.department = department;
    this.priority = priority;
    this.description = description;
    this.status = 'Raised';
    this.createdBy = createdBy;
    this.createdById = createdById;
    this.createdAt = new Date().toISOString();
    this.assignedToId = null; // User ID of the member working on it
    this.assignedToName = 'Unassigned';
    this.messages = []; // Chat history [{ sender: '', text: '', time: '' }]
  }
}

const Users = [
  { id: 'u1', name: 'Affan Kaskar', role: 'super_admin', dept: 'Management', email: 'admin@kuwaithospital.com' },
  { id: 'u2', name: 'Sarah IT', role: 'dept_head', dept: 'IT Support', email: 'it.head@kuwaithospital.com' },
  { id: 'u3', name: 'Ahmed HR', role: 'dept_head', dept: 'Human Resources', email: 'hr.head@kuwaithospital.com' },
  { id: 'u4', name: 'Mike IT', role: 'dept_member', dept: 'IT Support', email: 'mike.it@kuwaithospital.com' },
  { id: 'u5', name: 'John IT', role: 'dept_member', dept: 'IT Support', email: 'john.it@kuwaithospital.com' },
  { id: 'u6', name: 'Fatima HR', role: 'dept_member', dept: 'Human Resources', email: 'fatima.hr@kuwaithospital.com' },
  { id: 'u7', name: 'Regular Employee', role: 'employee', dept: 'Nursing', email: 'employee@kuwaithospital.com' },
];

// 2. State Management
const State = {
  getCurrentUser: () => JSON.parse(localStorage.getItem('currentUser')),
  setCurrentUser: (user) => localStorage.setItem('currentUser', JSON.stringify(user)),
  getTickets: () => JSON.parse(localStorage.getItem('tickets')) || [],
  saveTickets: (tickets) => localStorage.setItem('tickets', JSON.stringify(tickets)),
  
  addTicket: (ticket) => {
    const tickets = State.getTickets();
    tickets.unshift(ticket);
    State.saveTickets(tickets);
    // Simulate Email Sending
    console.log(`EMAIL SIMULATION: New Ticket ${ticket.id} sent to ${ticket.department} Head.`);
  },

  assignTicket: (ticketId, memberId) => {
    const tickets = State.getTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    const member = Users.find(u => u.id === memberId);
    if (ticket && member) {
      ticket.assignedToId = member.id;
      ticket.assignedToName = member.name;
      ticket.status = 'In Progress';
      State.saveTickets(tickets);
      console.log(`EMAIL SIMULATION: Ticket ${ticketId} assigned to ${member.name}.`);
    }
  },

  updateTicketStatus: (id, status) => {
    const tickets = State.getTickets();
    const ticket = tickets.find(t => t.id === id);
    if (ticket) {
      ticket.status = status;
      State.saveTickets(tickets);
      if(status === 'Resolved') {
        console.log(`EMAIL SIMULATION: Ticket ${id} marked as RESOLVED. Notification sent to ${ticket.createdBy}.`);
      }
    }
  },

  addChatMessage: (ticketId, senderName, text) => {
    const tickets = State.getTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      ticket.messages.push({
        sender: senderName,
        text: text,
        time: new Date().toISOString()
      });
      State.saveTickets(tickets);
    }
  },

  init: () => {
    if (!localStorage.getItem('tickets')) {
      const initialTickets = [
        new Ticket('Network Failure Ward A', 'IT Support', 'High', 'Internet is down in Ward A.', 'Regular Employee', 'u7'),
        new Ticket('Staff ID Request', 'Human Resources', 'Medium', 'New nurse needs ID card.', 'Sarah IT', 'u2'),
      ];
      State.saveTickets(initialTickets);
    }
  }
};

State.init();

// 3. UI Helpers
const formatDate = (dateString) => {
  const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const getStatusBadgeClass = (status) => {
  if(status === 'Raised') return 'badge-raised';
  if(status === 'Open') return 'badge-open';
  if(status === 'In Progress') return 'badge-progress';
  if(status === 'Resolved') return 'badge-resolved';
  if(status === 'Closed') return 'badge-closed';
  return 'badge-raised';
};

// 4. Page Logic
document.addEventListener('DOMContentLoaded', () => {
  const currentUser = State.getCurrentUser();
  const path = window.location.pathname;

  // USER PAGE
  if (document.getElementById('userTicketList')) {
    if (!currentUser) { window.location.href = 'index.html'; return; }
    renderUserPage();
  }

  // LOGIN PAGE
  if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');
    const userSelect = document.createElement('div');
    userSelect.className = 'form-group mt-4';
    userSelect.innerHTML = `
      <label class="form-label">Select Demo User</label>
      <select id="demoUserSelect" class="form-control">
        ${Users.map(u => `<option value="${u.id}">${u.name} (${u.role})</option>`).join('')}
      </select>
    `;
    loginForm.insertBefore(userSelect, loginForm.querySelector('button'));

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const userId = document.getElementById('demoUserSelect').value;
      const user = Users.find(u => u.id === userId);
      State.setCurrentUser(user);
      window.location.href = 'dashboard.html';
    });
  }

  // DASHBOARD PAGE
  if (document.getElementById('dashboard-app')) {
    if (!currentUser) { window.location.href = 'index.html'; return; }

    renderDashboard();
    
    // Set Header
    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('user-role-label').textContent = currentUser.role.replace('_', ' ').toUpperCase();
    document.getElementById('user-avatar-initial').textContent = currentUser.name.charAt(0);

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
      localStorage.removeItem('currentUser');
      window.location.href = 'index.html';
    });
  }

  // ADMIN PAGE
  if (document.getElementById('adminTicketList')) {
    renderAdminPage();
  }
});

function renderDashboard() {
  const user = State.getCurrentUser();
  const tickets = State.getTickets();
  let filteredTickets = [];

  // Filter Logic based on Role
  if (user.role === 'super_admin') {
    filteredTickets = tickets;
  } else if (user.role === 'dept_head') {
    // Sees tickets raised to their dept OR tickets they raised
    filteredTickets = tickets.filter(t => t.department === user.dept || t.createdById === user.id);
  } else if (user.role === 'dept_member') {
    // Sees tickets assigned to them OR tickets they raised
    filteredTickets = tickets.filter(t => t.assignedToId === user.id || t.createdById === user.id);
  } else {
    // Regular employee only sees their own
    filteredTickets = tickets.filter(t => t.createdById === user.id);
  }

  // Update Stats
  document.getElementById('stat-total').textContent = filteredTickets.length;
  document.getElementById('stat-active').textContent = filteredTickets.filter(t => t.status !== 'Resolved').length;
  document.getElementById('stat-completed').textContent = filteredTickets.filter(t => t.status === 'Resolved').length;

  const listEl = document.getElementById('ticket-list-container');
  if (filteredTickets.length === 0) {
    listEl.innerHTML = `<div class="empty-state"><i class="fas fa-folder-open"></i><p>No tickets found in this view.</p></div>`;
    return;
  }

  listEl.innerHTML = filteredTickets.map(t => `
    <div class="ticket-item" onclick="openTicketDetails('${t.id}')">
      <div class="ticket-info">
        <h4>${t.title} <span class="text-xs text-muted" style="font-weight:400">#${t.id}</span></h4>
        <div class="ticket-meta">
          <span><i class="far fa-user"></i> ${t.createdBy}</span>
          <span><i class="fas fa-building"></i> ${t.department}</span>
          <span><i class="fas fa-user-tag"></i> ${t.assignedToName}</span>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <span class="badge ${getStatusBadgeClass(t.status)}">${t.status}</span>
        <i class="fas fa-chevron-right text-muted"></i>
      </div>
    </div>
  `).join('');
}

function renderAdminPage() {
  const tickets = State.getTickets();
  renderAdminTickets(tickets);
  updateAdminStats(tickets);
  initAdminFilters();
}

function updateAdminStats(tickets) {
  document.getElementById('totalTickets').textContent = tickets.length;
  document.getElementById('openTickets').textContent = tickets.filter(t => t.status !== 'Resolved').length;
  document.getElementById('resolvedTickets').textContent = tickets.filter(t => t.status === 'Resolved').length;
}

function initAdminFilters() {
  const filter = document.getElementById('statusFilter');
  if (!filter) return;

  filter.addEventListener('change', () => {
    const status = filter.value;
    const tickets = State.getTickets();
    const filteredTickets = status === 'All' ? tickets : tickets.filter(t => t.status === status);
    renderAdminTickets(filteredTickets);
  });
}

function renderAdminTickets(tickets) {
  const listEl = document.getElementById('adminTicketList');
  if (!listEl) return;

  if (tickets.length === 0) {
    listEl.innerHTML = `<div class="empty-state"><i class="fas fa-folder-open"></i><p>No tickets found.</p></div>`;
    return;
  }

  listEl.innerHTML = tickets.map(t => `
    <div class="ticket-item" onclick="openAdminTicket('${t.id}')">
      <div class="ticket-info">
        <h4>${t.title} <span class="text-xs text-muted" style="font-weight:400">#${t.id}</span></h4>
        <div class="ticket-meta">
          <span><i class="far fa-user"></i> ${t.createdBy}</span>
          <span><i class="fas fa-building"></i> ${t.department}</span>
          <span><i class="fas fa-user-tag"></i> ${t.assignedToName}</span>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <span class="badge ${getStatusBadgeClass(t.status)}">${t.status}</span>
        <i class="fas fa-chevron-right text-muted"></i>
      </div>
    </div>
  `).join('');
}

window.openAdminTicket = (id) => {
  const ticket = State.getTickets().find(t => t.id === id);
  const modal = document.getElementById('adminTicketModal');
  const body = document.getElementById('adminModalBody');
  if (!ticket || !modal || !body) return;

  body.innerHTML = `
    <div class="p-6">
      <div class="flex justify-between items-start mb-6">
        <div>
          <h2 class="text-primary">${ticket.title}</h2>
          <p class="text-muted text-sm">Raised by ${ticket.createdBy} on ${formatDate(ticket.createdAt)}</p>
        </div>
        <span class="badge ${getStatusBadgeClass(ticket.status)}">${ticket.status}</span>
      </div>
      <div class="grid gap-6" style="grid-template-columns: 1fr 1fr;">
        <div>
          <label class="text-xs font-bold text-muted uppercase">Department</label>
          <p>${ticket.department}</p>
        </div>
        <div>
          <label class="text-xs font-bold text-muted uppercase">Priority</label>
          <p>${ticket.priority}</p>
        </div>
      </div>
      <div class="mt-6">
        <label class="text-xs font-bold text-muted uppercase">Description</label>
        <div class="bg-light p-4 rounded mt-2" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:15px;">
          ${ticket.description}
        </div>
      </div>
      <div class="admin-actions mt-6">
        <label class="font-semibold text-sm">Update Status</label>
        <div class="flex items-center gap-3 mt-3">
          <select id="adminStatusSelect" class="form-control" style="width: auto;">
            <option value="Raised" ${ticket.status === 'Raised' ? 'selected' : ''}>Raised</option>
            <option value="Open" ${ticket.status === 'Open' ? 'selected' : ''}>Open</option>
            <option value="In Progress" ${ticket.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Resolved" ${ticket.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
          </select>
          <button class="btn btn-outline" onclick="handleAdminStatusUpdate('${ticket.id}')">Update</button>
        </div>
      </div>
      <div class="mt-6">
        <label class="text-xs font-bold text-muted uppercase">Assigned To</label>
        <p>${ticket.assignedToName}</p>
      </div>
    </div>
  `;

  modal.classList.add('active');
};

window.closeAdminModal = () => document.getElementById('adminTicketModal').classList.remove('active');

window.handleAdminStatusUpdate = (id) => {
  const status = document.getElementById('adminStatusSelect').value;
  State.updateTicketStatus(id, status);
  renderAdminPage();
  openAdminTicket(id);
};

window.openTicketDetails = (id) => {
  const ticket = State.getTickets().find(t => t.id === id);
  const user = State.getCurrentUser();
  const modal = document.getElementById('detailModal');
  const body = document.getElementById('detailModalBody');

  let actionHtml = '';

  // Department Head assignment UI
  if (user.role === 'dept_head' && ticket.department === user.dept) {
    const deptMembers = Users.filter(u => u.role === 'dept_member' && u.dept === user.dept);
    actionHtml = `
      <div class="assign-section">
        <label class="font-semibold text-sm mb-2 block"><i class="fas fa-user-plus"></i> Assign to Member</label>
        <div class="flex gap-2">
          <select id="memberAssignSelect" class="form-control">
            <option value="">Choose member...</option>
            ${deptMembers.map(m => `<option value="${m.id}" ${ticket.assignedToId === m.id ? 'selected' : ''}>${m.name}</option>`).join('')}
          </select>
          <button class="btn btn-primary" onclick="handleAssignment('${ticket.id}')">Assign</button>
        </div>
      </div>
    `;
  }

  // Status Update UI (for Head or Member)
  if ((user.role === 'dept_head' && ticket.department === user.dept) || (user.role === 'dept_member' && ticket.assignedToId === user.id) || user.role === 'super_admin') {
    actionHtml += `
      <div class="admin-actions mt-4">
        <label class="font-semibold text-sm">Status:</label>
        <select id="statusUpdateSelect" class="form-control" style="width: auto">
          <option value="Open" ${ticket.status === 'Open' ? 'selected' : ''}>Open</option>
          <option value="In Progress" ${ticket.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
          <option value="Resolved" ${ticket.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
        </select>
        <button class="btn btn-outline" onclick="handleStatusUpdate('${ticket.id}')">Update</button>
      </div>
    `;
  }

  body.innerHTML = `
    <div class="p-6">
      <div class="flex justify-between items-start mb-6">
        <div>
          <h2 class="text-primary">${ticket.title}</h2>
          <p class="text-muted text-sm">Raised by ${ticket.createdBy} on ${formatDate(ticket.createdAt)}</p>
        </div>
        <span class="badge ${getStatusBadgeClass(ticket.status)}">${ticket.status}</span>
      </div>
      
      <div class="grid gap-6" style="grid-template-columns: 1fr 1fr;">
        <div>
          <label class="text-xs font-bold text-muted uppercase">Department</label>
          <p>${ticket.department}</p>
        </div>
        <div>
          <label class="text-xs font-bold text-muted uppercase">Priority</label>
          <p>${ticket.priority}</p>
        </div>
      </div>

      <div class="mt-6">
        <label class="text-xs font-bold text-muted uppercase">Description</label>
        <div class="bg-light p-4 rounded mt-2" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:15px;">
          ${ticket.description}
        </div>
      </div>

      ${actionHtml}

      <hr class="my-6" style="margin:20px 0; border:0; border-top:1px solid #eee;">

      <h3 class="mb-4">Internal Discussion</h3>
      <div class="chat-container">
        <div class="chat-messages" id="chat-box">
          ${ticket.messages.map(m => `
            <div class="message ${m.sender === user.name ? 'message-sent' : 'message-received'}">
              <div class="message-info">${m.sender} • ${formatDate(m.time)}</div>
              <div>${m.text}</div>
            </div>
          `).join('')}
          ${ticket.messages.length === 0 ? '<p class="text-center text-muted text-xs mt-10">No messages yet. Start the conversation.</p>' : ''}
        </div>
        <div class="chat-input-area">
          <input type="text" id="chat-input" class="form-control" placeholder="Type a message...">
          <button class="btn btn-primary" onclick="sendChat('${ticket.id}')"><i class="fas fa-paper-plane"></i></button>
        </div>
      </div>
    </div>
  `;
  modal.classList.add('active');
};

window.closeDetailModal = () => document.getElementById('detailModal').classList.remove('active');

window.handleAssignment = (id) => {
  const memberId = document.getElementById('memberAssignSelect').value;
  if (!memberId) return;
  State.assignTicket(id, memberId);
  openTicketDetails(id); // refresh
  renderDashboard();
};

window.handleStatusUpdate = (id) => {
  const status = document.getElementById('statusUpdateSelect').value;
  State.updateTicketStatus(id, status);
  openTicketDetails(id); // refresh
  renderDashboard();
};

window.sendChat = (id) => {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;
  const user = State.getCurrentUser();
  State.addChatMessage(id, user.name, text);
  openTicketDetails(id); // refresh
};

// Global New Ticket Handler
window.handleNewTicket = (e) => {
  e.preventDefault();
  const user = State.getCurrentUser();
  const title = document.getElementById('new-title').value;
  const dept = document.getElementById('new-dept').value;
  const priority = document.getElementById('new-priority').value;
  const desc = document.getElementById('new-desc').value;

  const t = new Ticket(title, dept, priority, desc, user.name, user.id);
  State.addTicket(t);
  
  document.getElementById('newTicketModal').classList.remove('active');
  document.getElementById('newTicketForm').reset();
  renderDashboard();
  alert('Ticket raised and department head notified!');
};
