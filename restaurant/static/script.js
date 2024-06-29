document.getElementById('bookingForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const dateInput = document.getElementById('date');
    const selectedDate = new Date(dateInput.value);
    const currentDate = new Date();
    const minBookingDate = new Date();
    minBookingDate.setDate(currentDate.getDate() + 7);

    if (selectedDate < minBookingDate) {
        document.getElementById('message').innerText = 'Bookings must be made at least one week in advance.';
    } else {
        const data = { date: dateInput.value };
        fetch('/api/book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById('message').innerText = data.message;
            updateCalendar();
        })
        .catch(error => {
            document.getElementById('message').innerText = 'An error occurred. Please try again.';
        });
    }
});

function updateCalendar() {
    fetch('/api/bookings')
        .then(response => response.json())
        .then(bookings => {
            const calendarContainer = document.getElementById('calendarData');
            calendarContainer.innerHTML = ''; // Clear previous calendar views
            const bookingList = document.createElement('ul'); // Create a list for bookings
            bookingList.id = 'bookingList';
            calendarContainer.appendChild(bookingList); // Append the list to the body or a specific container

            const currentDate = new Date();
            for (let i = 0; i < 3; i++) {
                const month = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
                const calendar = createMonthCalendar(month, bookings);
                calendarContainer.appendChild(calendar);
            }

            // Populate the booking list
            bookings.forEach(booking => {
                const listItem = document.createElement('li');
                listItem.innerText = `Booking on ${new Date(booking).toLocaleDateString()}`;
                bookingList.appendChild(listItem);
            });
        });
}

function createMonthCalendar(month, bookings) {
    const calendarCtr = document.createElement('div');
    const monthLabel = document.createElement('h3');
    const calendar = document.createElement('div');
    calendar.className = 'month-calendar';
    monthLabel.innerText = month.toLocaleDateString('default', { month: 'long', year: 'numeric' });
    calendarCtr.appendChild(monthLabel);
    calendarCtr.appendChild(calendar);

    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const startDayOfWeek = new Date(month.getFullYear(), month.getMonth(), 1).getDay();

    // Create placeholders for days before the first of the month
    for (let i = 0; i < startDayOfWeek; i++) {
        const placeholder = document.createElement('div');
        placeholder.className = 'calendar-day-placeholder';
        calendar.appendChild(placeholder);
    }

    // Create day elements
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.innerText = day;
        const dotsCtr = document.createElement('div');
        dotsCtr.className = 'booking-dots';
        dayElement.appendChild(dotsCtr);

        // Check if this day is the current day
        const dayDate = new Date(month.getFullYear(), month.getMonth(), day);
        const currentDate = new Date();
        if (dayDate.setHours(0,0,0,0) === currentDate.setHours(0,0,0,0)) {
            dayElement.classList.add('current-date'); // Apply the special style for today
        }
        
        const oneDay = 24 * 60 * 60 * 1000; // milliseconds in one day
        // Calculate the difference between this day and today
        const diffDays = Math.round((dayDate - currentDate) / oneDay);
        // Check if this day is within the next 7 days
        if (diffDays > 0 && diffDays < 7) {
            dayElement.classList.add('unbookable');
        }

        const dayBookings = bookings.filter(booking => {
            const bookingDate = new Date(booking);
            return bookingDate.getDate() === day && bookingDate.getMonth() === month.getMonth() && bookingDate.getFullYear() === month.getFullYear();
        });

        // Add a dot for each booking
        dayBookings.forEach(() => {
            const dot = document.createElement('span');
            dot.className = 'booking-dot';
            dotsCtr.appendChild(dot);
        });

        calendar.appendChild(dayElement);
    }

    return calendarCtr;
}

document.addEventListener('DOMContentLoaded', updateCalendar);
