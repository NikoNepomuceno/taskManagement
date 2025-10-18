import Swal, { SweetAlertIcon } from 'sweetalert2'

type NotifyOptions = {
  title?: string
  text?: string
  icon?: SweetAlertIcon
  timer?: number
  showProgressBar?: boolean
  allowOutsideClick?: boolean
  customClass?: {
    container?: string
    popup?: string
    title?: string
    content?: string
    confirmButton?: string
    cancelButton?: string
    actions?: string
    footer?: string
  }
}

export function notify(options: NotifyOptions) {
  const { 
    title, 
    text, 
    icon = 'info', 
    timer = 2000, 
    showProgressBar = true,
    allowOutsideClick = true,
    customClass
  } = options
  
  return Swal.fire({
    title: title || undefined,
    text: text || undefined,
    icon,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer,
    timerProgressBar: showProgressBar,
    allowOutsideClick,
    customClass: {
      container: 'swal2-toast-container',
      popup: 'swal2-toast-popup',
      title: 'swal2-toast-title',
      content: 'swal2-toast-content',
      ...customClass
    },
    didOpen: () => {
      // Add custom styling for better visual appeal
      const popup = document.querySelector('.swal2-toast-popup')
      if (popup) {
        popup.setAttribute('style', `
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.95);
        `)
      }
    }
  })
}

export function notifySuccess(message: string, title = 'Success') {
  return notify({ 
    title, 
    text: message, 
    icon: 'success',
    timer: 2500,
    customClass: {
      popup: 'swal2-toast-popup swal2-success-toast'
    }
  })
}

export function notifyError(message: string, title = 'Error') {
  return notify({ 
    title, 
    text: message, 
    icon: 'error', 
    timer: 4000,
    customClass: {
      popup: 'swal2-toast-popup swal2-error-toast'
    }
  })
}

export function notifyWarning(message: string, title = 'Warning') {
  return notify({ 
    title, 
    text: message, 
    icon: 'warning',
    timer: 3000,
    customClass: {
      popup: 'swal2-toast-popup swal2-warning-toast'
    }
  })
}

export function notifyInfo(message: string, title = 'Info') {
  return notify({ 
    title, 
    text: message, 
    icon: 'info',
    timer: 2500,
    customClass: {
      popup: 'swal2-toast-popup swal2-info-toast'
    }
  })
}

export function notifyLoading(message: string, title = 'Loading...') {
  return Swal.fire({
    title,
    text: message,
    icon: 'info',
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading()
      const popup = document.querySelector('.swal2-toast-popup')
      if (popup) {
        popup.setAttribute('style', `
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.95);
        `)
      }
    },
    customClass: {
      popup: 'swal2-toast-popup swal2-loading-toast'
    }
  })
}

export function notifyLoadingSuccess(message: string, title = 'Success') {
  // Close any existing loading notification
  Swal.close()
  
  // Show success notification
  return notifySuccess(message, title)
}

export function notifyLoadingError(message: string, title = 'Error') {
  // Close any existing loading notification
  Swal.close()
  
  // Show error notification
  return notifyError(message, title)
}


