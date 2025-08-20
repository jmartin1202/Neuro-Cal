# Interactive Calendar Guide

## Overview

The Interactive Calendar is a new feature in NeuroCal that provides an enhanced calendar experience with direct event creation and management. It allows users to click on calendar dates to create events and see them displayed directly on the calendar.

## Features

### 🗓️ **Interactive Date Selection**
- Click on any date to open the event creation modal
- Visual feedback with hover effects
- Today's date is highlighted with a blue background

### 📅 **Month Navigation**
- Navigate between months using left/right arrow buttons
- "Today" button to quickly return to the current month
- Smooth transitions between month views

### ✨ **Event Creation**
- **Title**: Required field for event name
- **Time**: Time picker for event start time
- **Duration**: Predefined duration options (15 min to All day)
- **Event Type**: Meeting, Focus Time, Break, or Travel
- **Location**: Optional location field
- **Description**: Optional detailed description

### 🎨 **Event Display**
- Events are color-coded by type:
  - 🔵 **Blue**: Meetings
  - 🟢 **Green**: Focus Time
  - 🟡 **Yellow**: Breaks
  - 🔴 **Red**: Travel
- Up to 2 events show on each date
- "+more" indicator for dates with additional events

### 🗑️ **Event Management**
- View existing events for any date
- Delete events with the X button
- Events are immediately reflected on the calendar

## How to Use

### 1. **Switch to Interactive Calendar**
- Use the toggle buttons at the top of the calendar section
- Choose between "Interactive" and "Classic" views

### 2. **Create an Event**
1. Click on any date in the calendar
2. Fill in the event details in the modal
3. Click "Add Event" to save
4. The event will appear on the calendar immediately

### 3. **Navigate Between Months**
- Use the ‹ and › buttons to move between months
- Click "Today" to return to the current month

### 4. **Manage Events**
- Click on a date with existing events to see them
- Use the X button to delete unwanted events
- Events are automatically updated on the calendar

## Technical Details

### Component Structure
- **InteractiveCalendar**: Main calendar component
- **Event Modal**: Form for creating/editing events
- **Calendar Grid**: Visual representation of dates and events

### State Management
- Local state for selected dates and modal visibility
- Event form state with validation
- Integration with the main app's event system

### Responsive Design
- Mobile-friendly interface
- Adaptive layout for different screen sizes
- Touch-friendly interactions

## Integration

The Interactive Calendar integrates seamlessly with:
- **Existing Event System**: Uses the same Event interface
- **Authentication**: Works with both authenticated and demo modes
- **Error Handling**: Includes error prevention and recovery
- **Performance**: Optimized with React.memo and useCallback

## Benefits

1. **Immediate Feedback**: Events appear on the calendar instantly
2. **Visual Clarity**: Color-coded events for easy identification
3. **Efficient Workflow**: Click date → fill form → save → done
4. **Better UX**: No need to navigate between different views
5. **Consistent Design**: Matches the overall NeuroCal aesthetic

## Future Enhancements

- Drag and drop event creation
- Event editing capabilities
- Recurring event support
- Calendar view switching (Week/Day views)
- Event search and filtering
- Integration with external calendar services

## Troubleshooting

### Common Issues

**Event not appearing**: Check that the title field is filled
**Modal not opening**: Ensure you're clicking on a valid date
**Events not saving**: Verify you're in developer mode or authenticated
**Calendar not updating**: Try refreshing the page or switching views

### Performance Tips

- Use the toggle to switch between calendar views as needed
- Close the event modal when not in use
- Limit the number of events per date for optimal performance

---

*The Interactive Calendar is designed to make event management intuitive and efficient. Enjoy the enhanced calendar experience!*
