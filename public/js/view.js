
const viewModeElements = document.querySelectorAll('.view-mode')

const editModeElements = document.querySelectorAll('.edit-mode')


const editBtn = document.getElementById('edit-btn')
const saveBtn = document.getElementById('save-btn')
const cancelBtn = document.getElementById('cancel-btn')


function enableEdit() {
    viewModeElements.forEach(el => el.classList.add('hidden'))
    editModeElements.forEach(el => el.classList.remove('hidden'))

  
    editBtn.classList.add('hidden')
    saveBtn.classList.remove('hidden')
    cancelBtn.classList.remove('hidden')
    document.getElementById('edit-review').focus()
}


function cancelEdit() {
    viewModeElements.forEach(el => el.classList.remove('hidden'))
    editModeElements.forEach(el => el.classList.add('hidden'))

    editBtn.classList.remove('hidden')
    saveBtn.classList.add('hidden')
    cancelBtn.classList.add('hidden')
}


