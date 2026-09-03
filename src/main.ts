import { createApp } from 'vue'
import App from './App.vue'
import logoUrl from './assets/logo.webp'
import './style.css'

function setFavicon(url: string): void {
	let link = document.querySelector<HTMLLinkElement>("link[rel='icon']")
	if (!link) {
		link = document.createElement('link')
		link.rel = 'icon'
		document.head.appendChild(link)
	}
	link.type = 'image/png'
	link.href = url
}

setFavicon(logoUrl)

createApp(App).mount('#app')
