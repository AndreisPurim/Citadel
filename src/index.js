import React from 'react';
import ReactDOM from 'react-dom/client';
import {HashRouter, Route, Routes} from 'react-router-dom';

import Alert from "@mui/material/Alert";
import {ThemeProvider, createTheme} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Snackbar from "@mui/material/Snackbar";

import './index.css';

import Homepage from './Pages/Homepage'
import Drafts from './Pages/Drafts'
import Pomodoro from './Pages/Pomodoro'
import Rituals from './Pages/Rituals'
import Todo from './Pages/Todo'

import Navbar from './Components/Navbar'
import Footer from './Components/Footer'


// #E4E4DE, sophisticated sage #C4C5BA, timeless noir #1B1B1B, muted moss #595f39

const CONTROL_COOKIE_KEY = "pms_control_v1";
const DEFAULT_ALERT = {open: false, text: "", severity: "success", hide: true};

const createDefaultDrafts = () => ({ activeId: null, items: [] });
const createDefaultRituals = () => ({ activeWeek: null, weeks: {} });
const createDefaultPomodoro = () => ({
	soundEnabled: true,
	notificationsEnabled: false,
	challenges: [],
	activeChallenge: "",
});
const createDefaultData = () => ({
	todos: {},
	drafts: createDefaultDrafts(),
	rituals: createDefaultRituals(),
	pomodoro: createDefaultPomodoro(),
});
const createDefaultControl = () => ({
	data: createDefaultData(),
	lightMode: "light",
	alert: { ...DEFAULT_ALERT },
});

const isPlainObject = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);

const normalizeData = (value) => {
	if (!isPlainObject(value)) {
		return createDefaultData();
	}
	const todos = isPlainObject(value.todos) ? value.todos : {};
	const draftsDefaults = createDefaultDrafts();
	const pomodoroDefaults = createDefaultPomodoro();
	const ritualsDefaults = createDefaultRituals();
	const draftsBase = isPlainObject(value.drafts) ? value.drafts : {};
	const ritualsBase = isPlainObject(value.rituals) ? value.rituals : {};
	const pomodoroBase = isPlainObject(value.pomodoro) ? value.pomodoro : {};
	const draftItems = Array.isArray(draftsBase.items)
		? draftsBase.items.filter((item) => isPlainObject(item) && typeof item.id === "string")
		: [];
	const drafts = {
		...draftsDefaults,
		...draftsBase,
		items: draftItems.map((item) => ({
			id: item.id,
			title: typeof item.title === "string" ? item.title : "Untitled",
			content: typeof item.content === "string" ? item.content : "",
		})),
	};
	const activeDraftId = typeof draftsBase.activeId === "string" ? draftsBase.activeId : drafts.items[0]?.id || null;
	drafts.activeId = drafts.items.some((item) => item.id === activeDraftId) ? activeDraftId : drafts.items[0]?.id || null;
	const rituals = {
		...ritualsDefaults,
		...ritualsBase,
		activeWeek: typeof ritualsBase.activeWeek === "string" ? ritualsBase.activeWeek : null,
		weeks: isPlainObject(ritualsBase.weeks) ? ritualsBase.weeks : {},
	};
	const pomodoro = {
		...pomodoroDefaults,
		...pomodoroBase,
		soundEnabled: typeof pomodoroBase.soundEnabled === "boolean" ? pomodoroBase.soundEnabled : pomodoroDefaults.soundEnabled,
		notificationsEnabled: typeof pomodoroBase.notificationsEnabled === "boolean"
			? pomodoroBase.notificationsEnabled
			: pomodoroDefaults.notificationsEnabled,
		challenges: Array.isArray(pomodoroBase.challenges)
			? pomodoroBase.challenges.filter((item) => typeof item === "string")
			: pomodoroDefaults.challenges,
		activeChallenge: typeof pomodoroBase.activeChallenge === "string" ? pomodoroBase.activeChallenge : "",
	};
	return { ...createDefaultData(), ...value, todos, drafts, rituals, pomodoro };
};

const normalizeControl = (value) => {
	const base = isPlainObject(value) ? value : {};
	const defaults = createDefaultControl();
	const data = normalizeData(base.data);
	const lightMode = base.lightMode === "dark" ? "dark" : "light";
	const alert = isPlainObject(base.alert) ? { ...DEFAULT_ALERT, ...base.alert } : { ...DEFAULT_ALERT };
	return { ...defaults, ...base, data, lightMode, alert };
};

const readCookieValue = (key) => {
	const cookies = document.cookie ? document.cookie.split("; ") : [];
	for (const cookie of cookies) {
		const eqIndex = cookie.indexOf("=");
		const name = eqIndex >= 0 ? cookie.slice(0, eqIndex) : cookie;
		if (name === key) {
			const rawValue = eqIndex >= 0 ? cookie.slice(eqIndex + 1) : "";
			return decodeURIComponent(rawValue);
		}
	}
	return null;
};

const loadControlFromCookies = () => {
	try {
		const raw = readCookieValue(CONTROL_COOKIE_KEY);
		if (!raw) {
			return createDefaultControl();
		}
		const parsed = JSON.parse(raw);
		const normalized = normalizeControl(parsed);
		return { ...normalized, alert: { ...normalized.alert, open: false } };
	} catch (error) {
		return createDefaultControl();
	}
};

const writeControlToCookies = (control) => {
	try {
		const encoded = encodeURIComponent(JSON.stringify(control));
		const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
		document.cookie = `${CONTROL_COOKIE_KEY}=${encoded}; expires=${expires}; path=/`;
	} catch (error) {
		// Ignore cookie write failures (disabled cookies or oversized data).
	}
};

function App(){
	const [control, setControl] = React.useState(() => loadControlFromCookies());
	const updateControl = (updater) => {
		setControl((prev) => {
			const nextValue = typeof updater === "function" ? updater(prev) : updater;
			return normalizeControl(nextValue);
		});
	};
	const setLightMode = (mode) => updateControl((prev) => ({ ...prev, lightMode: mode }));
	const setAlert = (next) => updateControl((prev) => ({ ...prev, alert: { ...prev.alert, ...next } }));
	const showAlert = (next) => setAlert({ ...next, open: true });
	React.useEffect(() => {
		writeControlToCookies(control);
	}, [control]);
	React.useEffect(() => {
		document.body.dataset.theme = control.lightMode;
	}, [control.lightMode]);
	const isDark = control.lightMode === "dark";
	const theme = React.useMemo(() => createTheme({
		palette: {
			primary: {main: isDark ? "#7dd9c7" : "#0e3b43"},
			secondary: {main: isDark ? "#f4b48b" : "#e07a5f"},
			background: {
				default: isDark ? "#0d1110" : "#f7f3ee",
				paper: isDark ? "#141c18" : "#fffdf8",
			},
			text: {
				primary: isDark ? "#e7efe8" : "#1d2520",
				secondary: isDark ? "#b9c6bd" : "#49544d",
			},
			mode: control.lightMode,
		},
		shape: {
			borderRadius: 18,
		},
		typography: {
			fontFamily: '"Space Grotesk", sans-serif',
			h1: {
				fontFamily: '"Fraunces", serif',
				fontWeight: 800,
				letterSpacing: "-0.02em",
			},
			h2: {
				fontFamily: '"Fraunces", serif',
				fontWeight: 700,
				letterSpacing: "-0.02em",
			},
			h3: {
				fontFamily: '"Fraunces", serif',
				fontWeight: 600,
			},
			button: {
				textTransform: "none",
				fontWeight: 600,
			},
		},
	}),[control.lightMode]);
	const sendControl = {
		lightMode: control.lightMode,
		setLightMode,
		control,
		setControl: updateControl,
		showAlert,
	};
	return(
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<HashRouter>
				<Navbar {...sendControl}/>
				<Routes>
					<Route path="/" element={<Homepage control={control} />}/>
					<Route path="/drafts" element={<Drafts control={control} setControl={updateControl} />}/>
					<Route path="/todo" element={<Todo control={control} setControl={updateControl} />}/>
					<Route path="/pomodoro" element={<Pomodoro control={control} setControl={updateControl} showAlert={showAlert} />}/>
					<Route path="/rituals" element={<Rituals control={control} setControl={updateControl} />}/>
				</Routes>
				<Snackbar open={control.alert.open} autoHideDuration={control.alert.hide?1000:null} onClose={()=>setAlert({open: false})}>
					<Alert elevation={6} variant="filled" severity={control.alert.severity}>
						{control.alert.text}
					</Alert>
				</Snackbar>
			<Footer />
			</HashRouter>
		</ThemeProvider>
	)
}


ReactDOM.createRoot(document.getElementById('root')).render(<App />);

