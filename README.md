# TDV

# Process
## Key decisions
### State management
I used the NgRx library for state management. It is based on the Redux flow and is implemented on top of Angular signals.
### Datetimes
The spec asks for ISO 8601 datetimes, so that's what is sent between the UI and API. This datetime is interpreted on the frontend for a clean UX and validated on the backend with `isoformat()`.
### Error handling
I created a message service that can be used to send messages to the frontend. Messages sent are displayed as toast messages.
### UX
I used Material UI for its simplicity. The form is expandable and collapsible, and I specifically avoided modals as those tend to be annoying for operation flows. The filter options are accessible at the top of the page.
### Satellites
To improve UX when filtering by satellite ID, I added names to satellites which included API support for mapping IDs to names. This also meant satellite IDs sent with telemetry POST requests had to be correct. The API does validate IDs, but the process is simplified with a satellite dropdown in the form.
### Testing
I used Karma testing in the Angular frontend since that's what I'm familiar with. The tests are rudimentary as I wasn't able to figure out NgRx effect mocking, but the basic setup is there for that to be expanded upon.
# Assumptions
I assumed the following:
- Telemetry points showing a critical condition for the satellite have very low altitude and velocity readings (e.g. 1 and 1) to easily distinguish it as N/A readings.
- The list of satellites rarely changes, so constraining satellite IDs on the form to add telemetry points to just the satellites in the system is user-friendly.
- We want a reliable system that minimizes the possibility of faulty input. Therefore, it is best to lock edits while an edit is currently processing.

## Setup

```bash
npm install
```

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Building

To build the project run:

```bash
ng build
```

## Running unit tests

```bash
ng test
```



