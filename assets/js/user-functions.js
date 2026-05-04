// USER PAGE FUNCTIONS

function populateDepartmentDropdown() {
  const depts = State.getDepartments();
  const select = document.getElementById('department');
  if (!select) return;
  
  // Clear existing options except the first one
  select.innerHTML = '<option value="">Select Department...</option>';
  
  // Add departments from storage
  depts.forEach(dept => {
    const option = document.createElement('option');
    option.value = dept.name;
    option.textContent = dept.name;
    select.appendChild(option);
  });
}

function renderUserPage() {
  const user = State.getCurrentUser();
  const tickets = State.getTickets().filter(t => t.createdById === user.id);
  
  // Populate department dropdown
  populateDepartmentDropdown();
  
  // Setup modal event listeners
  const modal = document.getElementById('ticketModal');
  const newTicketBtn = document.getElementById('newTicketBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const closeBtn = document.querySelector('#ticketModal .close-btn');
  const ticketForm = document.getElementById('ticketForm');
  
  if (newTicketBtn) {
    newTicketBtn.addEventListener('click', () => {
      modal.classList.add('active');
      populateDepartmentDropdown(); // Refresh in case departments were added
    });
  }
  
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }
  
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }
  
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }
  
  if (ticketForm) {
    ticketForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleUserTicketSubmit();
    });
  }
  
  renderUserTickets();
}

function handleUserTicketSubmit() {
  const user = State.getCurrentUser();
  const title = document.getElementById('title').value;
  const department = document.getElementById('department').value;
  const priority = document.getElementById('priority').value;
  const description = document.getElementById('description').value;
  
  if (!title || !department || !description) {
    alert('Please fill in all required fields.');
    return;
  }
  
  const ticket = new Ticket(title, department, priority, description, user.name, user.id);
  State.addTicket(ticket);
  
  document.getElementById('ticketForm').reset();
  document.getElementById('ticketModal').classList.remove('active');
  
  alert(`✓ Ticket ${ticket.id} has been raised!\nStatus: ${ticket.status}\nYour ticket has been sent to the Super Admin for assignment.`);
  
  renderUserTickets();
}

function renderUserTickets() {
  const user = State.getCurrentUser();
  const tickets = State.getTickets().filter(t => t.createdById === user.id);
  const listEl = document.getElementById('userTicketList');
  
  if (tickets.length === 0) {
    listEl.innerHTML = `<div class="empty-state" style="padding: 40px; text-align: center;"><i class="fas fa-inbox" style="font-size: 3rem; color: #ccc; margin-bottom: 15px; display: block;"></i><p style="color: #999; font-size: 0.95rem;">No tickets raised yet. Create one to get support!</p></div>`;
    return;
  }
  
  listEl.innerHTML = tickets.map(t => `
    <div class="ticket-card" onclick="viewUserTicketDetails('${t.id}')" style="padding: 15px; margin-bottom: 10px; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; background: #fff; transition: all 0.2s; display: flex; justify-content: space-between; align-items: center;" onmouseover="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.08)'" onmouseout="this.style.boxShadow='none'">
      <div style="flex: 1;">
        <div style="font-weight: 600; color: #1a202c; margin-bottom: 5px;">${t.title} <span style="font-size: 0.8rem; color: #a0aec0;">#${t.id}</span></div>
        <div style="font-size: 0.85rem; color: #718096; display: flex; gap: 15px;">
          <span><i class="fas fa-building"></i> ${t.department}</span>
          <span><i class="fas fa-flag"></i> ${t.priority}</span>
          <span><i class="far fa-calendar"></i> ${formatDate(t.createdAt)}</span>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 15px;">
        <span class="badge ${getStatusBadgeClass(t.status)}" style="padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 500;">${t.status}</span>
        <i class="fas fa-chevron-right" style="color: #cbd5e0;"></i>
      </div>
    </div>
  `).join('');
}

window.viewUserTicketDetails = (ticketId) => {
  const ticket = State.getTickets().find(t => t.id === ticketId);
  if (!ticket) return;
  
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.id = 'userDetailModal';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 700px;">
      <div class="modal-header">
        <h3>Ticket Details - #${ticket.id}</h3>
        <button class="close-btn" onclick="document.getElementById('userDetailModal').remove()"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 25px;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
          <div>
            <h2 style="color: #1a202c; margin-bottom: 5px;">${ticket.title}</h2>
            <p style="color: #718096; font-size: 0.9rem;">Ticket ID: <strong>#${ticket.id}</strong></p>
          </div>
          <span class="badge ${getStatusBadgeClass(ticket.status)}" style="padding: 6px 16px; border-radius: 20px; font-weight: 600;">${ticket.status}</span>
        </div>
        
        <div style="background: #e6ffed; padding: 12px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #10b981;">
          <p style="font-size: 0.9rem; color: #1f3a1f;"><strong>Status Update:</strong> ${getStatusDescription(ticket.status)}</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
          <div>
            <label style="font-size: 0.75rem; color: #718096; font-weight: 600; text-transform: uppercase;">Department</label>
            <p style="color: #1a202c; margin-top: 5px;">${ticket.department}</p>
          </div>
          <div>
            <label style="font-size: 0.75rem; color: #718096; font-weight: 600; text-transform: uppercase;">Priority</label>
            <p style="color: #1a202c; margin-top: 5px;">${ticket.priority}</p>
          </div>
          <div>
            <label style="font-size: 0.75rem; color: #718096; font-weight: 600; text-transform: uppercase;">Created</label>
            <p style="color: #1a202c; margin-top: 5px;">${formatDate(ticket.createdAt)}</p>
          </div>
          <div>
            <label style="font-size: 0.75rem; color: #718096; font-weight: 600; text-transform: uppercase;">Assigned To</label>
            <p style="color: #1a202c; margin-top: 5px;">${ticket.assignedToName}</p>
          </div>
        </div>
        
        <div style="margin-bottom: 25px;">
          <label style="font-size: 0.75rem; color: #718096; font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 10px;">Description</label>
          <div style="background: #f7fafc; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; color: #2d3748; line-height: 1.6;">${ticket.description}</div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
};

function getStatusDescription(status) {
  const descriptions = {
    'Raised': '🎫 Your ticket has been created and sent to the department. Waiting for department head to review.',
    'Open': '✓ Your ticket is now OPEN. A department member is working on your issue.',
    'In Progress': '⚙️ Your ticket is being actively worked on by the assigned member.',
    'Resolved': '✅ Your ticket has been RESOLVED by the department. Issue has been completed.',
    'Closed': '✔️ Your ticket is now CLOSED. If you need further assistance, you can raise a new ticket.'
  };
  return descriptions[status] || 'Your ticket is being processed.';
}
