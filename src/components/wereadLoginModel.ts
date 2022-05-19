import { remote, BrowserWindow } from 'electron';
import { Notice } from 'obsidian';
import { parseCookies } from '../utils/cookiesUtil';
import { settingsStore } from '../settings';
import { WereadSettingsTab } from '../settingTab';
const { BrowserWindow: RemoteBrowserWindow } = remote;

export default class WereadLoginModel {
	private modal: BrowserWindow;
	private settingTab: WereadSettingsTab;
	constructor(settingTab: WereadSettingsTab) {
		this.settingTab = settingTab;
		this.modal = new RemoteBrowserWindow({
			parent: remote.getCurrentWindow(),
			width: 960,
			height: 540,
			show: false
		});

		this.modal.once('ready-to-show', () => {
			this.modal.setTitle('登录微信读书~');
			this.modal.show();
		});

		const session = this.modal.webContents.session;
		const filter = {
			urls: ['https://weread.qq.com/web/user?userVid=*']
		};
		session.webRequest.onSendHeaders(filter, (details) => {
			const cookies = details.requestHeaders['Cookie'];
			const cookieArr = parseCookies(cookies);
			const wr_name = cookieArr.find((cookie) => cookie.name == 'wr_name').value;
			if (wr_name !== '') {
				settingsStore.actions.setCookies(cookieArr);
				settingTab.display();
				this.modal.close();
			} else {
				this.modal.reload();
			}
		});
	}

	async doLogin() {
		try {
			await this.modal.loadURL('https://weread.qq.com/#login');
		} catch (error) {
			console.log(error);
			new Notice('加载微信读书登录页面失败');
		}
	}

	onClose() {
		this.modal.close();
	}
}
