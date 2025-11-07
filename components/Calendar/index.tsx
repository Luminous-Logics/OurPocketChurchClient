/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useCallback } from "react";
import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import moment from "moment";
import { Plus, ChevronLeft, ChevronRight, Clock, MapPin, Users } from "lucide-react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./styles.scss";

const localizer = momentLocalizer(moment);

// Event types for different categories
const eventTypes = {
  mass: { color: "#6D28D9", label: "Mass" },
  meeting: { color: "#2563EB", label: "Meeting" },
  prayer: { color: "#059669", label: "Prayer" },
  event: { color: "#F59E0B", label: "Event" },
  wedding: { color: "#DB2777", label: "Wedding" },
  baptism: { color: "#0EA5E9", label: "Baptism" },
};

interface Event {
  id: number;
  title: string;
  start: Date;
  end: Date;
  type: keyof typeof eventTypes;
  location?: string;
  description?: string;
}

// Static events data
const staticEvents: Event[] = [
  {
    id: 1,
    title: "Sunday Mass",
    start: new Date(2025, 10, 9, 9, 0),
    end: new Date(2025, 10, 9, 10, 30),
    type: "mass",
    location: "Main Church",
    description: "Regular Sunday morning mass service",
  },
  {
    id: 2,
    title: "Parish Council Meeting",
    start: new Date(2025, 10, 10, 18, 0),
    end: new Date(2025, 10, 10, 20, 0),
    type: "meeting",
    location: "Parish Hall",
    description: "Monthly parish council meeting",
  },
  {
    id: 3,
    title: "Evening Prayer",
    start: new Date(2025, 10, 11, 18, 30),
    end: new Date(2025, 10, 11, 19, 30),
    type: "prayer",
    location: "Chapel",
    description: "Evening prayer and meditation",
  },
  {
    id: 4,
    title: "Youth Group Meeting",
    start: new Date(2025, 10, 12, 17, 0),
    end: new Date(2025, 10, 12, 19, 0),
    type: "event",
    location: "Youth Center",
    description: "Weekly youth group gathering",
  },
  {
    id: 5,
    title: "Wedding Ceremony",
    start: new Date(2025, 10, 13, 14, 0),
    end: new Date(2025, 10, 13, 16, 0),
    type: "wedding",
    location: "Main Church",
    description: "John & Mary's Wedding",
  },
  {
    id: 6,
    title: "Baptism Ceremony",
    start: new Date(2025, 10, 14, 11, 0),
    end: new Date(2025, 10, 14, 12, 0),
    type: "baptism",
    location: "Baptistry",
    description: "Infant baptism ceremony",
  },
  {
    id: 7,
    title: "Choir Practice",
    start: new Date(2025, 10, 15, 19, 0),
    end: new Date(2025, 10, 15, 21, 0),
    type: "event",
    location: "Music Room",
    description: "Weekly choir practice session",
  },
  {
    id: 8,
    title: "Sunday Mass",
    start: new Date(2025, 10, 16, 9, 0),
    end: new Date(2025, 10, 16, 10, 30),
    type: "mass",
    location: "Main Church",
    description: "Regular Sunday morning mass service",
  },
];

const CalendarComponent = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>(Views.MONTH);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [events, setEvents] = useState<Event[]>(staticEvents);

  // Form state for new event
  const [newEvent, setNewEvent] = useState({
    title: "",
    type: "mass" as keyof typeof eventTypes,
    startDate: moment().format("YYYY-MM-DD"),
    startTime: "09:00",
    endDate: moment().format("YYYY-MM-DD"),
    endTime: "10:00",
    location: "",
    description: "",
  });

  // Custom event style getter
  const eventStyleGetter = useCallback((event: Event) => {
    const eventType = eventTypes[event.type];
    return {
      style: {
        backgroundColor: eventType.color,
        borderRadius: "8px",
        opacity: 0.9,
        color: "white",
        border: "none",
        display: "block",
        fontSize: "13px",
        padding: "4px 8px",
      },
    };
  }, []);

  // Handle event selection
  const handleSelectEvent = useCallback((event: Event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  }, []);

  // Handle navigation
  const onNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
  }, []);

  const onView = useCallback((newView: View) => {
    setView(newView);
  }, []);

  // Custom toolbar
  const CustomToolbar = ({ label, onNavigate, onView }: any) => {
    return (
      <div className="calendar-toolbar">
        <div className="toolbar-left">
          <button className="btn-icon" onClick={() => onNavigate("PREV")}>
            <ChevronLeft size={20} />
          </button>
          <button className="btn-today" onClick={() => onNavigate("TODAY")}>
            Today
          </button>
          <button className="btn-icon" onClick={() => onNavigate("NEXT")}>
            <ChevronRight size={20} />
          </button>
          <h2 className="toolbar-label">{label}</h2>
        </div>

        <div className="toolbar-right">
          <div className="view-switcher">
            <button
              className={`view-btn ${view === Views.MONTH ? "active" : ""}`}
              onClick={() => onView(Views.MONTH)}
            >
              Month
            </button>
            <button
              className={`view-btn ${view === Views.WEEK ? "active" : ""}`}
              onClick={() => onView(Views.WEEK)}
            >
              Week
            </button>
            <button
              className={`view-btn ${view === Views.DAY ? "active" : ""}`}
              onClick={() => onView(Views.DAY)}
            >
              Day
            </button>
            <button
              className={`view-btn ${view === Views.AGENDA ? "active" : ""}`}
              onClick={() => onView(Views.AGENDA)}
            >
              Agenda
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-container">
      {/* Header */}
      <div className="calendar-header">
        <div>
          <h1>Parish Calendar</h1>
          <p>Manage and view all parish events and schedules</p>
        </div>
        <button className="add-event-button">
          <Plus size={16} />
          <span>Add Event</span>
        </button>
      </div>

      {/* Legend */}
      <div className="calendar-legend">
        {Object.entries(eventTypes).map(([key, type]) => (
          <div key={key} className="legend-item">
            <div className="legend-color" style={{ backgroundColor: type.color }}></div>
            <span>{type.label}</span>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="calendar-wrapper">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "calc(100vh - 300px)", minHeight: "600px" }}
          view={view}
          onView={onView}
          date={currentDate}
          onNavigate={onNavigate}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          components={{
            toolbar: CustomToolbar,
          }}
          popup
          selectable
        />
      </div>

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="event-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ borderLeftColor: eventTypes[selectedEvent.type].color }}>
              <div>
                <div className="event-type-badge" style={{ backgroundColor: eventTypes[selectedEvent.type].color }}>
                  {eventTypes[selectedEvent.type].label}
                </div>
                <h3>{selectedEvent.title}</h3>
              </div>
              <button className="close-btn" onClick={() => setShowEventModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="event-detail">
                <Clock size={18} />
                <div>
                  <p className="detail-label">Time</p>
                  <p className="detail-value">
                    {moment(selectedEvent.start).format("MMM DD, YYYY • h:mm A")} -{" "}
                    {moment(selectedEvent.end).format("h:mm A")}
                  </p>
                </div>
              </div>

              {selectedEvent.location && (
                <div className="event-detail">
                  <MapPin size={18} />
                  <div>
                    <p className="detail-label">Location</p>
                    <p className="detail-value">{selectedEvent.location}</p>
                  </div>
                </div>
              )}

              {selectedEvent.description && (
                <div className="event-detail">
                  <Users size={18} />
                  <div>
                    <p className="detail-label">Description</p>
                    <p className="detail-value">{selectedEvent.description}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowEventModal(false)}>
                Close
              </button>
              <button className="btn-primary">Edit Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarComponent;
