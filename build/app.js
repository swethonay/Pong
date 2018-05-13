import electron from 'electron';
import shortcut from 'electron-localshortcut';
const { app, BrowserWindow } = electron;

app.on('ready', () => {
	const window = new BrowserWindow({ width: 900, height: 650, frame: false });

	window.loadURL(`file://${__dirname}/index.html`);
	shortcut.register(window, 'Esc', () => window.close());
});
