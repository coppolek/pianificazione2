import React, { useState } from 'react';
import { Calendar, GripHorizontal, Clock, X, User, Users, Building2, Menu, ChevronRight, UserPlus, Plus, Save, Trash2 } from 'lucide-react';

interface ScheduleItem {
  id: string;
  time: string;
  activity: string;
  hours: number;
}

interface DaySchedule {
  day: string;
  items: ScheduleItem[];
}

interface TimeEditModal {
  show: boolean;
  item: ScheduleItem | null;
  targetDayIndex: number | null;
  operatorIndex: number | null;
}

interface OperatorSchedule {
  name: string;
  schedule: DaySchedule[];
  isJolly?: boolean;
}

interface WorkSite {
  id: string;
  name: string;
  schedule: {
    [key: string]: { // day of week
      shifts: {
        startTime: string;
        endTime: string;
        operatorCount: number;
      }[];
    };
  };
}

const DAYS_OF_WEEK = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];

const initialScheduleData: DaySchedule[] = [
  {
    day: "Lunedì",
    items: [
      { id: "1", time: "6:50 - 8:30", activity: "MARINA BLU (CON MONICA)", hours: 2.5 },
      { id: "2", time: "14:00 - 15:30", activity: "BANCA MALATESTIANA CELLE", hours: 1.5 },
      { id: "3", time: "16:45 - 20:00", activity: "OPPORTUNITY", hours: 3.25 },
    ]
  },
  {
    day: "Martedì",
    items: [
      { id: "4", time: "5:30 - 7:30", activity: "TRASCONTI + MARIA", hours: 2 },
      { id: "5", time: "8:00 - 11:00", activity: "F.LLI ROSSI POGGIO TORRIANA + MARIA", hours: 3 },
      { id: "6", time: "12:00 - 14:00", activity: "NINAIA", hours: 1 },
      { id: "7", time: "14:00 - 15:00", activity: "BANCA MALATESTIANA CELLE", hours: 1 },
      { id: "8", time: "17:30 - 21:00", activity: "COCCI + SIMONCELLI", hours: 3.5 },
    ]
  },
  {
    day: "Mercoledì",
    items: [
      { id: "9", time: "4:30 - 7:30", activity: "NUOVA RICERCA + CARMEN", hours: 3 },
      { id: "10", time: "8:00 - 9:00", activity: "LAB TRAVEL + CARMEN", hours: 1 },
    ]
  },
  {
    day: "Giovedì",
    items: [
      { id: "11", time: "9:00 - 12:00", activity: "SCM STEELMEC VILLA VERUCCHIO + MARIANNA", hours: 3 },
      { id: "12", time: "16:00 - 18:00", activity: "SAMIR VIA TANARO 3/O", hours: 1 },
      { id: "13", time: "16:00 - 18:30", activity: "SAMIR VIA LUCIANO LAMA 8", hours: 2.5 },
    ]
  },
  {
    day: "Venerdì",
    items: [
      { id: "14", time: "10:00 - 18:30", activity: "SCM VIA EMILIA 71 MARCONI + ABDEL", hours: 8 },
      { id: "15", time: "4:30 - 7:30", activity: "NUOVA RICERCA - RIMINI + LJUBOV", hours: 3 },
    ]
  },
  {
    day: "Sabato",
    items: [
      { id: "16", time: "6:00 - 9:00", activity: "SAMIR + CARMEN", hours: 3 },
      { id: "17", time: "11:00 - 18:30", activity: "SCM VIA EMILIA 71 MARCONI + ABDEL", hours: 7.5 },
    ]
  },
  {
    day: "Domenica",
    items: [
      { id: "18", time: "4:00 - 9:00", activity: "SCM VIA EMILIA 77 ASTOLFI - RIMINI + LATIFA", hours: 5 },
      { id: "19", time: "14:30 - 19:30", activity: "SCM VIA EMILIA 77 ASTOLFI - RIMINI + LATIFA", hours: 5 },
    ]
  }
];

function App() {
  const [operators, setOperators] = useState<OperatorSchedule[]>([
    { name: "Operatrice 1", schedule: [...initialScheduleData] },
    { name: "Operatrice 2", schedule: [...initialScheduleData] },
    { name: "Operatrice 3", schedule: [...initialScheduleData] },
    { name: "Operatrice 4", schedule: [...initialScheduleData] },
    { name: "Jolly 1", schedule: [...initialScheduleData], isJolly: true },
    { name: "Jolly 2", schedule: [...initialScheduleData], isJolly: true },
    { name: "Jolly 3", schedule: [...initialScheduleData], isJolly: true }
  ]);
  
  const [workSites, setWorkSites] = useState<WorkSite[]>([]);
  const [newWorkSite, setNewWorkSite] = useState<string>("");
  const [editingSite, setEditingSite] = useState<WorkSite | null>(null);
  const [draggedItem, setDraggedItem] = useState<{ operatorIndex: number, dayIndex: number, itemIndex: number } | null>(null);
  const [timeEditModal, setTimeEditModal] = useState<TimeEditModal>({
    show: false,
    item: null,
    targetDayIndex: null,
    operatorIndex: null
  });
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [editingName, setEditingName] = useState<{ index: number, value: string } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState<'schedule' | 'operators' | 'sites'>('schedule');

  const handleDragStart = (operatorIndex: number, dayIndex: number, itemIndex: number) => {
    setDraggedItem({ operatorIndex, dayIndex, itemIndex });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetOperatorIndex: number, targetDayIndex: number) => {
    if (draggedItem === null) return;

    const sourceOperator = operators[draggedItem.operatorIndex];
    const sourceDay = sourceOperator.schedule[draggedItem.dayIndex];
    const item = sourceDay.items[draggedItem.itemIndex];

    setTimeEditModal({
      show: true,
      item,
      targetDayIndex,
      operatorIndex: targetOperatorIndex
    });

    const [start, end] = item.time.split(" - ");
    setNewStartTime(start);
    setNewEndTime(end);
  };

  const handleTimeConfirm = () => {
    if (!timeEditModal.item || timeEditModal.targetDayIndex === null || timeEditModal.operatorIndex === null || !draggedItem) return;

    const newOperators = [...operators];
    const sourceOperator = newOperators[draggedItem.operatorIndex];
    const sourceDay = sourceOperator.schedule[draggedItem.dayIndex];
    const [movedItem] = sourceDay.items.splice(draggedItem.itemIndex, 1);

    const startTime = new Date(`2000/01/01 ${newStartTime}`);
    const endTime = new Date(`2000/01/01 ${newEndTime}`);
    const hoursDiff = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

    const updatedItem = {
      ...movedItem,
      time: `${newStartTime} - ${newEndTime}`,
      hours: Number(hoursDiff.toFixed(2))
    };

    newOperators[timeEditModal.operatorIndex].schedule[timeEditModal.targetDayIndex].items.push(updatedItem);
    newOperators[timeEditModal.operatorIndex].schedule[timeEditModal.targetDayIndex].items.sort((a, b) => {
      const aTime = new Date(`2000/01/01 ${a.time.split(" - ")[0]}`);
      const bTime = new Date(`2000/01/01 ${b.time.split(" - ")[0]}`);
      return aTime.getTime() - bTime.getTime();
    });

    setOperators(newOperators);
    setDraggedItem(null);
    setTimeEditModal({ show: false, item: null, targetDayIndex: null, operatorIndex: null });
  };

  const isTimeValid = () => {
    if (!newStartTime || !newEndTime) return false;
    const start = new Date(`2000/01/01 ${newStartTime}`);
    const end = new Date(`2000/01/01 ${newEndTime}`);
    return start < end;
  };

  const startEditingOperatorName = (index: number) => {
    setEditingName({ index, value: operators[index].name });
  };

  const saveOperatorName = () => {
    if (editingName && editingName.value.trim()) {
      const newOperators = [...operators];
      newOperators[editingName.index].name = editingName.value.trim();
      setOperators(newOperators);
    }
    setEditingName(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveOperatorName();
    } else if (e.key === 'Escape') {
      setEditingName(null);
    }
  };

  const handleAddWorkSite = () => {
    if (!newWorkSite.trim()) return;
    
    const newSite: WorkSite = {
      id: crypto.randomUUID(),
      name: newWorkSite.trim(),
      schedule: DAYS_OF_WEEK.reduce((acc, day) => {
        acc[day] = { shifts: [] };
        return acc;
      }, {} as WorkSite['schedule'])
    };
    
    setWorkSites([...workSites, newSite]);
    setNewWorkSite("");
  };

  const handleAddShift = (siteId: string, day: string) => {
    const updatedSites = workSites.map(site => {
      if (site.id === siteId) {
        const shifts = [...site.schedule[day].shifts, {
          startTime: "09:00",
          endTime: "17:00",
          operatorCount: 1
        }];
        return {
          ...site,
          schedule: {
            ...site.schedule,
            [day]: { shifts }
          }
        };
      }
      return site;
    });
    setWorkSites(updatedSites);
  };

  const handleUpdateShift = (
    siteId: string,
    day: string,
    shiftIndex: number,
    field: 'startTime' | 'endTime' | 'operatorCount',
    value: string | number
  ) => {
    const updatedSites = workSites.map(site => {
      if (site.id === siteId) {
        const shifts = [...site.schedule[day].shifts];
        shifts[shiftIndex] = {
          ...shifts[shiftIndex],
          [field]: field === 'operatorCount' ? Number(value) : value
        };
        return {
          ...site,
          schedule: {
            ...site.schedule,
            [day]: { shifts }
          }
        };
      }
      return site;
    });
    setWorkSites(updatedSites);
  };

  const handleDeleteShift = (siteId: string, day: string, shiftIndex: number) => {
    const updatedSites = workSites.map(site => {
      if (site.id === siteId) {
        const shifts = site.schedule[day].shifts.filter((_, index) => index !== shiftIndex);
        return {
          ...site,
          schedule: {
            ...site.schedule,
            [day]: { shifts }
          }
        };
      }
      return site;
    });
    setWorkSites(updatedSites);
  };

  const handleDeleteWorkSite = (siteId: string) => {
    setWorkSites(workSites.filter(site => site.id !== siteId));
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'operators':
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Anagrafica Operatori
            </h2>
            <div className="space-y-4">
              {operators.filter(op => !op.isJolly).map((operator, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <h3 className="font-medium">{operator.name}</h3>
                    </div>
                    <button className="text-xs text-blue-600 hover:text-blue-800">
                      Modifica
                    </button>
                  </div>
                  <div className="text-sm text-gray-600">
                    Ore settimanali: {operator.schedule.reduce((acc, day) => 
                      acc + day.items.reduce((dayAcc, item) => dayAcc + item.hours, 0), 0
                    )}
                  </div>
                </div>
              ))}
            </div>

            <h2 className="text-xl font-bold mt-8 mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              Operatori Jolly
            </h2>
            <div className="space-y-4">
              {operators.filter(op => op.isJolly).map((operator, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <h3 className="font-medium">{operator.name}</h3>
                    </div>
                    <button className="text-xs text-blue-600 hover:text-blue-800">
                      Modifica
                    </button>
                  </div>
                  <div className="text-sm text-gray-600">
                    Ore settimanali: {operator.schedule.reduce((acc, day) => 
                      acc + day.items.reduce((dayAcc, item) => dayAcc + item.hours, 0), 0
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'sites':
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Gestione Cantieri
            </h2>
            
            {/* Add new work site */}
            <div className="mb-6 flex gap-2">
              <input
                type="text"
                value={newWorkSite}
                onChange={(e) => setNewWorkSite(e.target.value)}
                placeholder="Nome del nuovo cantiere"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <button
                onClick={handleAddWorkSite}
                disabled={!newWorkSite.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Aggiungi Cantiere
              </button>
            </div>

            {/* Work sites list */}
            <div className="space-y-6">
              {workSites.map(site => (
                <div key={site.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">{site.name}</h3>
                    <button
                      onClick={() => handleDeleteWorkSite(site.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="p-4">
                    {DAYS_OF_WEEK.map(day => (
                      <div key={day} className="mb-4 last:mb-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-700">{day}</h4>
                          <button
                            onClick={() => handleAddShift(site.id, day)}
                            className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            Aggiungi Turno
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          {site.schedule[day].shifts.map((shift, shiftIndex) => (
                            <div key={shiftIndex} className="flex items-center gap-3 bg-gray-50 p-2 rounded">
                              <input
                                type="time"
                                value={shift.startTime}
                                onChange={(e) => handleUpdateShift(site.id, day, shiftIndex, 'startTime', e.target.value)}
                                className="text-sm rounded border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                              />
                              <span className="text-gray-500">-</span>
                              <input
                                type="time"
                                value={shift.endTime}
                                onChange={(e) => handleUpdateShift(site.id, day, shiftIndex, 'endTime', e.target.value)}
                                className="text-sm rounded border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                              />
                              <div className="flex items-center gap-2 ml-4">
                                <label className="text-sm text-gray-600">Operatori:</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={shift.operatorCount}
                                  onChange={(e) => handleUpdateShift(site.id, day, shiftIndex, 'operatorCount', e.target.value)}
                                  className="w-16 text-sm rounded border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                />
                              </div>
                              <button
                                onClick={() => handleDeleteShift(site.id, day, shiftIndex)}
                                className="ml-auto text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="p-4">
            {operators.map((operator, operatorIndex) => (
              <div key={operatorIndex} className="mb-8">
                <div className={`mb-3 bg-white rounded-lg shadow-sm p-2 flex items-center justify-between ${
                  operator.isJolly ? 'border-l-4 border-blue-500' : ''
                }`}>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    {editingName?.index === operatorIndex ? (
                      <input
                        type="text"
                        value={editingName.value}
                        onChange={(e) => setEditingName({ ...editingName, value: e.target.value })}
                        onBlur={saveOperatorName}
                        onKeyDown={handleKeyDown}
                        className="text-sm font-medium text-gray-800 border-b border-blue-300 focus:border-blue-500 focus:outline-none px-1"
                        autoFocus
                      />
                    ) : (
                      <div
                        onClick={() => startEditingOperatorName(operatorIndex)}
                        className="text-sm font-medium text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
                      >
                        {operator.name}
                        {operator.isJolly && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            Jolly
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-600">
                    Ore Totali: {operator.schedule.reduce((acc, day) => 
                      acc + day.items.reduce((dayAcc, item) => dayAcc + item.hours, 0), 0
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-2">
                  {operator.schedule.map((day, dayIndex) => (
                    <div 
                      key={day.day} 
                      className="bg-white rounded-lg shadow-sm overflow-hidden"
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(operatorIndex, dayIndex)}
                    >
                      <div className="bg-blue-600 text-white px-2 py-1 flex justify-between items-center">
                        <h2 className="text-sm font-medium">{day.day}</h2>
                        <span className="text-xs bg-blue-500 px-1.5 py-0.5 rounded">
                          {day.items.reduce((acc, item) => acc + item.hours, 0)} ore
                        </span>
                      </div>
                      <div className="p-1.5 space-y-1">
                        {day.items.map((item, itemIndex) => (
                          <div 
                            key={item.id}
                            draggable
                            onDragStart={() => handleDragStart(operatorIndex, dayIndex, itemIndex)}
                            className="group bg-gray-50 rounded border border-gray-200 hover:border-blue-300 transition-colors cursor-move"
                          >
                            <div className="flex items-start gap-1 p-1.5">
                              <GripHorizontal className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <div className="text-[11px] font-medium text-blue-600 leading-tight">{item.time}</div>
                                  <div className="text-[11px] text-gray-500 leading-tight ml-1">
                                    {item.hours}h
                                  </div>
                                </div>
                                <div className="text-[11px] text-gray-800 font-medium leading-tight break-words">
                                  {item.activity}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-16'} flex flex-col`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h1 className={`font-bold text-gray-900 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
            Gestione
          </h1>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          <button
            onClick={() => setActiveSection('schedule')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              activeSection === 'schedule' 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className={`transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
              Pianificazione
            </span>
            {!isSidebarOpen && activeSection === 'schedule' && (
              <ChevronRight className="w-4 h-4 ml-auto" />
            )}
          </button>
          <button
            onClick={() => setActiveSection('operators')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              activeSection === 'operators' 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className={`transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
              Anagrafica Operatori
            </span>
            {!isSidebarOpen && activeSection === 'operators' && (
              <ChevronRight className="w-4 h-4 ml-auto" />
            )}
          </button>
          <button
            onClick={() => setActiveSection('sites')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              activeSection === 'sites' 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span className={`transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
              Cantieri
            </span>
            {!isSidebarOpen && activeSection === 'sites' && (
              <ChevronRight className="w-4 h-4 ml-auto" />
            )}
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderContent()}

        {timeEditModal.show && timeEditModal.item && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-4 w-full max-w-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Modifica Orario
                </h3>
                <button
                  onClick={() => setTimeEditModal({ show: false, item: null, targetDayIndex: null, operatorIndex: null })}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-1">Attività:</p>
                <p className="text-sm font-medium">{timeEditModal.item.activity}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Ora Inizio
                  </label>
                  <input
                    type="time"
                    value={newStartTime}
                     onChange={(e) => setNewStartTime(e.target.value )}
                    className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Ora Fine
                  </label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setTimeEditModal({ show: false, item: null, targetDayIndex: null, operatorIndex: null })}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                >
                  Annulla
                </button>
                <button
                  onClick={handleTimeConfirm}
                  disabled={!isTimeValid()}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  Salva
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;