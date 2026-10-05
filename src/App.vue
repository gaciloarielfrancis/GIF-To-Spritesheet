<script setup lang="ts">
import { computed, ref } from 'vue'
import AppNav from './components/AppNav.vue'
import AppFooter from './components/AppFooter.vue'
import FileDropzone from './components/FileDropzone.vue'
import SettingsForm from './components/SettingsForm.vue'
import type { IOutputOptions } from './components/SettingsForm.vue'
import ResultToolbar from './components/ResultToolbar.vue'
import PreviewGrid from './components/PreviewGrid.vue'
import ProcessingLoader from './components/ProcessingLoader.vue'
import { useGifConverter } from './composables/useGifConverter'
import { fileToArrayBuffer } from './utils/arrays'
import type { TBuffer } from './types'
import logoUrl from './assets/logo.webp'

const files = ref<File[]>([])
const options = ref<IOutputOptions>({ width: 0, height: 0, quality: 100, format: 'png', columns: 10 })
const preparing = ref(false)
const convertError = ref<string | null>(null)

const converter = useGifConverter()
const { spritesheets, processing, hasResults, progress, error, zipping } = converter

const canConvert = computed(() => files.value.length > 0 && !processing.value && !preparing.value)

function handleFilesChange(next: File[]): void {
	files.value = next
	convertError.value = null
}

function removeFile(index: number): void {
	files.value = files.value.filter((_, i) => i !== index)
}

function clearAll(): void {
	files.value = []
	convertError.value = null
}

	async function handleConvert(): Promise<void> {
	if (!canConvert.value) return
	preparing.value = true
	convertError.value = null
	try {
		const buffers: TBuffer[] = []
		for (const file of files.value) {
			const buffer = await fileToArrayBuffer(file)
			buffers.push({ buffer, name: file.name, size: file.size })
		}
		await converter.convert(buffers, {
			width: Math.max(0, Math.floor(options.value.width || 0)),
			height: Math.max(0, Math.floor(options.value.height || 0)),
			quality: Math.min(100, Math.max(1, Math.floor(options.value.quality || 100))),
			format: options.value.format,
			columns: Math.min(10, Math.max(1, Math.floor(options.value.columns || 10))),
		})
		if (converter.error.value) convertError.value = converter.error.value
	} catch (err) {
		convertError.value = err instanceof Error ? err.message : 'Could not read the selected files.'
	} finally {
		preparing.value = false
	}
}

function handleReset(): void {
	converter.reset()
	convertError.value = null
	files.value = []
	window.scrollTo({ top: 0, behavior: 'smooth' })
}

const steps = [
	{ n: '01', title: 'Drop animations', text: 'GIF or animated WebP — files never leave your browser.' },
	{ n: '02', title: 'Tune output', text: 'Frame size, quality, format and grid columns.' },
	{ n: '03', title: 'Export', text: 'Preview sheets, grab a ZIP with images + JSON.' },
]
</script>

<template>
	<div class="relative min-h-screen overflow-x-clip bg-zinc-950 font-sans text-zinc-100">
		<div class="pointer-events-none absolute inset-0" aria-hidden="true">
			<div class="absolute -top-40 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-lime-500/10 blur-[140px]"></div>
			<div class="absolute right-[-180px] top-64 h-[380px] w-[380px] rounded-full bg-violet-600/10 blur-[120px]"></div>
			<div class="absolute left-[-160px] top-[560px] h-[320px] w-[320px] rounded-full bg-cyan-500/10 blur-[120px]"></div>
		</div>

		<AppNav />

		<main class="relative mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6">
			<section class="mx-auto max-w-3xl pb-8 pt-10 text-center sm:pt-14">
				<p class="animate-fade-up mx-auto inline-flex items-center gap-2 rounded-full border border-lime-400/25 bg-lime-400/10 px-4 py-1.5 text-xs font-bold text-lime-300">
					<span class="size-1.5 animate-pulse rounded-full bg-lime-400"></span>
					FREE · PRIVATE · NO UPLOAD — RUNS 100% LOCALLY
				</p>
				<h1 class="sr-only">GIF and WebP to Spritesheet — convert animations to spritesheets in seconds</h1>
				<figure class="animate-fade-up stagger-1 mx-auto mt-6 w-full max-w-xl overflow-hidden rounded-3xl bg-black shadow-[0_0_90px_rgba(139,92,246,0.28)] ring-1 ring-white/15">
					<img :src="logoUrl" alt="GIF to Spritesheet — convert animation to spritesheet" class="w-full" />
				</figure>
				<p class="animate-fade-up stagger-2 mx-auto mt-4 max-w-xl text-balance text-[15px] leading-relaxed text-zinc-400 sm:text-base">
					Drop in animated GIFs or WebP files and get game-ready sprite sheets plus TexturePacker-style frame data JSON —
					perfect for Phaser, PixiJS, Unity and CSS animations.
				</p>
				<div class="animate-fade-up stagger-3 mx-auto mt-6 grid max-w-2xl grid-cols-1 gap-2.5 text-left sm:grid-cols-3">
					<div v-for="s in steps" :key="s.n" class="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 backdrop-blur">
						<p class="font-mono text-[11px] font-bold text-lime-400">{{ s.n }}</p>
						<p class="mt-1 text-sm font-bold text-white">{{ s.title }}</p>
						<p class="mt-0.5 text-xs leading-relaxed text-zinc-400">{{ s.text }}</p>
					</div>
				</div>
			</section>

			<div class="grid items-start gap-5 lg:grid-cols-[400px_minmax(0,1fr)]">
				<aside class="animate-fade-up stagger-2 rounded-3xl border border-white/10 bg-zinc-900/60 p-5 shadow-2xl backdrop-blur-xl sm:p-6 lg:sticky lg:top-24">
					<div class="mb-4 flex items-center justify-between">
						<h2 class="text-sm font-extrabold uppercase tracking-widest text-white">Converter</h2>
						<button
							v-if="files.length > 0"
							type="button"
							:disabled="processing"
							class="text-xs font-bold text-zinc-500 transition hover:text-red-400 disabled:opacity-40"
							@click="clearAll"
						>
							Clear all
						</button>
					</div>

					<p class="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-500"><span class="text-lime-400">1 ·</span> Source files</p>
					<FileDropzone :files="files" :disabled="processing || preparing" @change="handleFilesChange" @remove="removeFile" />

					<p class="mb-3 mt-6 text-xs font-bold uppercase tracking-widest text-zinc-500"><span class="text-lime-400">2 ·</span> Output settings</p>
					<SettingsForm v-model="options" :disabled="processing || preparing" />

					<button
						type="button"
						:disabled="!canConvert"
						class="mt-6 w-full rounded-2xl bg-lime-400 px-5 py-3.5 text-[15px] font-black text-zinc-950 shadow-[0_10px_40px_rgba(163,230,53,0.35)] transition hover:bg-lime-300 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500 disabled:shadow-none"
						@click="handleConvert"
					>
						<span v-if="preparing || processing">Working…</span>
						<span v-else-if="files.length === 0">Add GIFs or WebP to convert</span>
						<span v-else>⚡ Convert {{ files.length }} file{{ files.length > 1 ? 's' : '' }}</span>
					</button>
					<p class="mt-2.5 text-center text-[11px] text-zinc-500">Original size when width & height are 0 · quality applies to JPEG / WEBP</p>

					<div v-if="convertError || error" class="mt-4 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-[13px] leading-relaxed text-red-300">
						{{ convertError || error }}
					</div>

					<div class="mt-5 rounded-2xl border border-white/5 bg-zinc-950/60 p-4 text-xs leading-relaxed text-zinc-500">
						<p class="font-bold text-zinc-300">💡 Tips</p>
						<ul class="mt-1.5 list-disc space-y-1 pl-4">
							<li>PNG keeps transparency; JPEG is smallest but opaque.</li>
							<li>Fewer columns = taller sheet; 10 matches the classic layout.</li>
							<li>The ZIP contains each sheet image plus its <span class="font-mono text-zinc-300">.json</span> frame map.</li>
						</ul>
					</div>
				</aside>

				<section class="animate-fade-up stagger-3 min-w-0">
					<div v-if="hasResults && !processing" class="space-y-5">
						<ResultToolbar :sheets="spritesheets" :zipping="zipping" @download-zip="converter.downloadZip()" @reset="handleReset" />
						<PreviewGrid :sheets="spritesheets" @download-image="converter.downloadSheet" @download-json="converter.downloadJson" />
					</div>

					<div v-else class="overflow-hidden rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/30 p-8 text-center backdrop-blur sm:p-12">
						<div class="mx-auto grid size-16 place-items-center rounded-2xl bg-white/5 text-zinc-500">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="size-8" aria-hidden="true">
								<rect x="3" y="3" width="18" height="18" rx="3" />
								<path d="M3 9h18M9 21V9" />
							</svg>
						</div>
						<h2 class="mx-auto mt-5 max-w-md text-xl font-extrabold text-white">Your spritesheets will appear here</h2>
						<p class="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-400">
							Add GIF or WebP animations on the left and hit convert. Each animation becomes one horizontal-strip sheet plus a JSON map
							with <span class="font-mono text-zinc-200">x, y, w, h</span> per frame.
						</p>
						<div class="mx-auto mt-6 max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 text-left">
							<div class="flex items-center gap-1.5 border-b border-white/5 px-4 py-2.5">
								<span class="size-2.5 rounded-full bg-red-500/70"></span>
								<span class="size-2.5 rounded-full bg-amber-400/70"></span>
								<span class="size-2.5 rounded-full bg-lime-400/70"></span>
								<span class="ml-2 font-mono text-[11px] text-zinc-500">player-run.json</span>
							</div>
							<pre class="thin-scroll overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-zinc-400">{
  <span class="text-lime-300">"frames"</span>: {
    <span class="text-lime-300">"player-run-0"</span>: { <span class="text-lime-300">"frame"</span>: { <span class="text-violet-300">"x"</span>: 0, <span class="text-violet-300">"y"</span>: 0, <span class="text-violet-300">"w"</span>: 64, <span class="text-violet-300">"h"</span>: 64 } },
    <span class="text-lime-300">"player-run-1"</span>: { <span class="text-lime-300">"frame"</span>: { <span class="text-violet-300">"x"</span>: 64, <span class="text-violet-300">"y"</span>: 0, <span class="text-violet-300">"w"</span>: 64, <span class="text-violet-300">"h"</span>: 64 } }
  },
  <span class="text-lime-300">"meta"</span>: { <span class="text-lime-300">"image"</span>: <span class="text-amber-300">"player-run.png"</span>, <span class="text-lime-300">"scale"</span>: 1 }
}</pre>
						</div>
					</div>
				</section>
			</div>
		</main>

		<AppFooter />
		<ProcessingLoader :processing="processing" :progress="progress" />
	</div>
</template>
