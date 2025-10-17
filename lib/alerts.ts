import Swal, { SweetAlertIcon } from 'sweetalert2'

type NotifyOptions = {
  title?: string
  text?: string
  icon?: SweetAlertIcon
  timer?: number
}

export function notify(options: NotifyOptions) {
  const { title, text, icon = 'info', timer = 2000 } = options
  return Swal.fire({
    title: title || undefined,
    text: text || undefined,
    icon,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer,
    timerProgressBar: true,
  })
}

export function notifySuccess(message: string, title = 'Success') {
  return notify({ title, text: message, icon: 'success' })
}

export function notifyError(message: string, title = 'Error') {
  return notify({ title, text: message, icon: 'error', timer: 3000 })
}


