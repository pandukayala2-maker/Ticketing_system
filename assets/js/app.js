// --- app.js (v3: Departments Management & Assignment) ---

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

class Department {
  constructor(name, head) {
    this.id = 'DEPT-' + Math.floor(1000 + Math.random() * 9000);
    this.name = name;
    this.headId = head; // User ID of dept head
    this.headName = Users.find(u => u.id === head)?.name || 'Unassigned';
    this.members = []; // Array of user IDs
    this.createdAt = new Date().toISOString();
  }
}

let Users = [
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
  getDepartments: () => JSON.parse(localStorage.getItem('departments')) || [],
  saveDepartments: (depts) => localStorage.setItem('departments', JSON.stringify(depts)),
  
  createDepartment: (name, headId) => {
    const dept = new Department(name, headId);
    const depts = State.getDepartments();
    depts.push(dept);
    State.saveDepartments(depts);
    console.log(`Department created: ${name}`);
    return dept;
  },

  addMemberToDept: (deptId, userId) => {
    const depts = State.getDepartments();
    const dept = depts.find(d => d.id === deptId);
    if (dept && !dept.members.includes(userId)) {
      dept.members.push(userId);
      State.saveDepartments(depts);
      console.log(`User added to department`);
    }
  },

  removeMemberFromDept: (deptId, userId) => {
    const depts = State.getDepartments();
    const dept = depts.find(d => d.id === deptId);
    if (dept) {
      dept.members = dept.members.filter(u => u !== userId);
      State.saveDepartments(depts);
    }
  },

  getDeptMembers: (deptId) => {
    const dept = State.getDepartments().find(d => d.id === deptId);
    if (!dept) return [];
    return Users.filter(u => dept.members.includes(u.id) || u.id === dept.headId);
  },

  addTicket: (ticket) => {
    const tickets = State.getTickets();
    tickets.unshift(ticket);
    State.saveTickets(tickets);
    // Simulate Email Sending
    console.log(`EMAIL SIMULATION: New Ticket ${ticket.id} sent to Super Admin for assignment.`);
  },

  getDepartmentByName: (name) => {
    return State.getDepartments().find(d => d.name === name);
  },

  getAssignableUsers: (departmentName) => {
    const dept = State.getDepartmentByName(departmentName);
    if (!dept) return [];
    const head = Users.find(u => u.id === dept.headId);
    const members = Users.filter(u => dept.members.includes(u.id));
    return [head, ...members].filter(Boolean);
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
    // Initialize departments if not exists
    if (!localStorage.getItem('departments')) {
      const initialDepts = [
        new Department('IT Support', 'u2'),
        new Department('Human Resources', 'u3'),
      ];
      initialDepts[0].members = ['u4', 'u5'];
      initialDepts[1].members = ['u6'];
      State.saveDepartments(initialDepts);
    }

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

// Get tickets visible to a specific user based on role and department
const getVisibleTickets = (user) => {
  const tickets = State.getTickets();
  
  // Super admin sees all tickets
  if (user.role === 'super_admin') {
    return tickets;
  }
  
  // Dept head sees tickets raised to their department + tickets they created
  if (user.role === 'dept_head') {
    return tickets.filter(t => t.department === user.dept || t.createdById === user.id);
  }
  
  // Dept member sees tickets assigned to them + tickets they created
  if (user.role === 'dept_member') {
    return tickets.filter(t => t.assignedToId === user.id || t.createdById === user.id);
  }
  
  // Regular employee only sees their own
  return tickets.filter(t => t.createdById === user.id);
};

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
    if (!currentUser) { window.location.href = 'index.html'; return; }
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
  const user = State.getCurrentUser();
  
  // Update header with current user info
  const userSpan = document.querySelector('.user-profile span.font-semibold');
  if (userSpan) {
    userSpan.textContent = `${user.name} (${user.role.replace('_', ' ')})`;
  }
  
  const avatarDiv = document.querySelector('.user-profile .avatar');
  if (avatarDiv) {
    avatarDiv.textContent = user.name.charAt(0).toUpperCase();
  }
  
  // Setup logout
  const logoutLink = document.querySelector('.user-profile a');
  if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
      localStorage.removeItem('currentUser');
    });
  }
  
  let tickets = State.getTickets();
  
  // Filter tickets based on user role and department
  tickets = getVisibleTickets(user);
  
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
    const user = State.getCurrentUser();
    let tickets = State.getTickets();
    
    // Apply role-based filtering
    tickets = getVisibleTickets(user);
    
    // Apply status filter
    const status = filter.value;
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
  const user = State.getCurrentUser();
  const ticket = State.getTickets().find(t => t.id === id);
  const modal = document.getElementById('adminTicketModal');
  const body = document.getElementById('adminModalBody');
  if (!ticket || !modal || !body || !user) return;

  const assignOptions = State.getAssignableUsers(ticket.department).map(member => `
            <option value="${member.id}" ${ticket.assignedToId === member.id ? 'selected' : ''}>${member.name} (${member.role.replace('_', ' ')})</option>
          `).join('');

  const assignSection = user.role === 'super_admin' ? `
      <div class="admin-actions mt-6">
        <label class="font-semibold text-sm mb-2 block"><i class="fas fa-user-plus"></i> Assign Ticket</label>
        <div class="flex items-center gap-3">
          <select id="adminAssignSelect" class="form-control" style="width: auto;">
            <option value="">Choose assignee...</option>
            ${assignOptions}
          </select>
          <button class="btn btn-primary" onclick="handleAdminAssignment('${ticket.id}')">Assign</button>
        </div>
      </div>
    ` : '';

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
      ${assignSection}
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

window.handleAdminAssignment = (id) => {
  const assigneeId = document.getElementById('adminAssignSelect').value;
  if (!assigneeId) {
    alert('Please choose a user to assign this ticket.');
    return;
  }
  State.assignTicket(id, assigneeId);
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

// ===== DEPARTMENT MANAGEMENT =====
window.renderDepartmentsPage = () => {
  const container = document.getElementById('dept-management-container');
  if (!container) return;
  
  const depts = State.getDepartments();
  
  let html = `
    <div style="margin-bottom: 30px;">
      <button onclick="openCreateDeptModal()" style="padding: 12px 24px; background: var(--navy); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
        <i class="fas fa-plus"></i> Create New Department
      </button>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 25px;">
  `;
  
  depts.forEach(dept => {
    const headUser = Users.find(u => u.id === dept.headId);
    const memberUsers = Users.filter(u => dept.members.includes(u.id));
    
    html += `
      <div style="background: var(--white); border: 1px solid #f1f5f9; border-radius: 16px; padding: 24px; box-shadow: 0 10px 25px rgba(15,23,42,0.1);">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
          <h3 style="margin: 0; color: var(--navy); font-size: 18px;">${dept.name}</h3>
          <button onclick="deleteDepartment('${dept.id}')" style="background: #fee2e2; color: #dc2626; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">Delete</button>
        </div>
        
        <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9;">
          <label style="font-size: 12px; font-weight: 700; color: var(--slate); text-transform: uppercase;">Department Head</label>
          <p style="margin: 8px 0 0 0; color: var(--navy); font-weight: 600;">${headUser?.name || 'Unassigned'}</p>
        </div>
        
        <div style="margin-bottom: 16px;">
          <label style="font-size: 12px; font-weight: 700; color: var(--slate); text-transform: uppercase;">Members (${memberUsers.length})</label>
          <div style="margin-top: 8px; max-height: 150px; overflow-y: auto;">
            ${memberUsers.length === 0 ? '<p style="color: #999; font-size: 12px;">No members assigned</p>' : memberUsers.map(m => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 13px;">
                <span>${m.name}</span>
                <button onclick="removeMemberFromDept('${dept.id}', '${m.id}')" style="background: none; border: none; color: #dc2626; cursor: pointer; font-size: 12px;">Remove</button>
              </div>
            `).join('')}
          </div>
        </div>
        
        <button onclick="openAddMemberModal('${dept.id}', '${dept.name}')" style="width: 100%; padding: 10px; background: var(--navy-light); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;">
          <i class="fas fa-user-plus"></i> Add Member
        </button>
      </div>
    `;
  });
  
  html += `</div>`;
  container.innerHTML = html;
};

window.openCreateDeptModal = () => {
  const modal = document.getElementById('modal-create-dept');
  const headSelect = document.getElementById('cd-head');
  
  // Populate heads dropdown
  headSelect.innerHTML = '<option value="">Select Head...</option>';
  Users.filter(u => u.role === 'super_admin' || u.role === 'dept_head' || u.role === 'dept_member').forEach(u => {
    const option = document.createElement('option');
    option.value = u.id;
    option.textContent = `${u.name} (${u.role})`;
    headSelect.appendChild(option);
  });
  
  // Clear input
  document.getElementById('cd-name').value = '';
  
  modal.classList.add('open');
};

window.closeCreateDeptModal = () => {
  document.getElementById('modal-create-dept').classList.remove('open');
};

window.submitCreateDept = () => {
  const name = document.getElementById('cd-name').value.trim();
  const headId = document.getElementById('cd-head').value;
  
  if (!name || !headId) {
    alert('Please fill in all fields');
    return;
  }
  
  State.createDepartment(name, headId);
  closeCreateDeptModal();
  renderDepartmentsPage();
  alert('Department created successfully!');
};

window.currentDeptId = null;

window.openAddMemberModal = (deptId, deptName) => {
  const modal = document.getElementById('modal-add-member');
  const memberSelect = document.getElementById('am-member');
  
  window.currentDeptId = deptId;
  
  // Get dept members
  const dept = State.getDepartments().find(d => d.id === deptId);
  const currentMembers = dept ? dept.members : [];
  
  // Populate members dropdown with non-members
  memberSelect.innerHTML = '<option value="">Select Member...</option>';
  Users.filter(u => u.role !== 'super_admin' && !currentMembers.includes(u.id) && u.id !== dept?.headId).forEach(u => {
    const option = document.createElement('option');
    option.value = u.id;
    option.textContent = `${u.name} (${u.role})`;
    memberSelect.appendChild(option);
  });
  
  modal.classList.add('open');
};

window.closeAddMemberModal = () => {
  document.getElementById('modal-add-member').classList.remove('open');
};

window.submitAddMember = () => {
  const userId = document.getElementById('am-member').value;
  
  if (!userId) {
    alert('Please select a member');
    return;
  }
  
  const user = Users.find(u => u.id === userId);
  State.addMemberToDept(window.currentDeptId, userId);
  closeAddMemberModal();
  renderDepartmentsPage();
  alert(`${user.name} added to department!`);
};

window.removeMemberFromDept = (deptId, userId) => {
  if (confirm('Remove this member from the department?')) {
    State.removeMemberFromDept(deptId, userId);
    renderDepartmentsPage();
  }
};

window.deleteDepartment = (deptId) => {
  if (confirm('Delete this department? This action cannot be undone.')) {
    const depts = State.getDepartments();
    const filtered = depts.filter(d => d.id !== deptId);
    State.saveDepartments(filtered);
    renderDepartmentsPage();
  }
};
