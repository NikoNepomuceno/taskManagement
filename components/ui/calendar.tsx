'use client'

import * as React from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

// FullCalendar styles must be imported at the component or a global layout
import '@fullcalendar/common/main.css'
import '@fullcalendar/daygrid/main.css'
import '@fullcalendar/timegrid/main.css'

type CalendarProps = {
  className?: string
  initialView?: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'
  initialDate?: string | Date
  editable?: boolean
  selectable?: boolean
  events?: any
  headerToolbar?: any
  height?: string | number
}

function Calendar({
  className,
  initialView = 'dayGridMonth',
  initialDate,
  editable = false,
  selectable = false,
  events,
  headerToolbar = { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' },
  height = 'auto',
}: CalendarProps) {
  return (
    <div className={className}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={initialView}
        initialDate={initialDate as any}
        editable={editable}
        selectable={selectable}
        events={events}
        headerToolbar={headerToolbar}
        height={height}
      />
    </div>
  )
}

export { Calendar }
