<script setup lang="ts">
import { ref } from 'vue'
import { formatBytes } from '../utils/arrays'

const props = defineProps<{
	disabled?: boolean
	files: File[]
}>()

const emit = defineEmits<{
	(e: 'change', files: File[]): void
	(e: 'remove', index: number): void
}>()

const dragOver = ref(false)
const dragDepth = ref(0)
const fileInput = ref<HTMLInputElement | null>(null)
const rejected = ref<string | null>(null)

function acceptFiles(list: FileList | File[]): void {
	const incoming = Array.from(list)
	const gifs = incoming.filter((f) => f.type === 'image/gif')
	const bad = incoming.length - gifs.length
	rejected.value = bad > 0 ? `${bad} non-GIF file${bad > 1 ? 's were' : ' was'} ignored — only .gif is supported.` : null
	if (gifs.length === 0) return
	emit('change', [...props.files, ...gifs])
}

function onDrop(event: DragEvent): void {
	event.preventDefault()
	dragOver.value = false
	dragDepth.value = 0
	if (props.disabled || !event.dataTransfer) return
	acceptFiles(event.dataTransfer.files)
}

function onPick(event: Event): void {
	const input = event.target as HTMLInputElement
	if (input.files) acceptFiles(input.files)
	input.value = ''
}
</script>

<template>
	<div>
		<div
			role="button"
			tabindex="0"
			aria-label="Upload GIF files"
			:class="[
				'group relative flex min-h-[190px] cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-all duration-200',
				dragOver
					? 'border-lime-400 bg-lime-400/10 scale-[1.01]'
					: 'border-zinc-700 bg-zinc-900/60 hover:border-lime-400/60 hover:bg-zinc-900',
				props.disabled ? 'pointer-events-none opacity-50' : '',
			]"
			@dragover.prevent="dragOver = true"
			@dragenter.prevent="dragDepth++ ; dragOver = true"
			@dragleave.prevent="dragDepth = Math.max(0, dragDepth - 1); if (dragDepth === 0) dragOver = false"
			@drop="onDrop"
			@click="fileInput?.click()"
			@keydown.enter="fileInput?.click()"
			@keydown.space.prevent="fileInput?.click()"
		>
			<input ref="fileInput" type="file" accept="image/gif,.gif" multiple class="hidden" @change="onPick" />

			<div
				:class="[
					'grid size-14 place-items-center rounded-2xl transition',
					dragOver ? 'bg-lime-400 text-zinc-950' : 'bg-white/5 text-lime-400 group-hover:bg-lime-400 group-hover:text-zinc-950',
				]"
			>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="size-7" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
				</svg>
			</div>
			<div>
				<p class="font-semibold text-white">
					{{ dragOver ? 'Drop your GIFs to add them' : 'Drag & drop GIFs here' }}
				</p>
				<p class="mt-1 text-sm text-zinc-400">
					or <span class="font-semibold text-lime-400 underline underline-offset-2">browse files</span>
					· multiple allowed · stays on your device
				</p>
			</div>
			<div class="flex flex-wrap items-center justify-center gap-1.5">
				<span class="rounded-md bg-white/5 px-2 py-1 font-mono text-[11px] text-zinc-400">.gif</span>
				<span class="rounded-md bg-white/5 px-2 py-1 font-mono text-[11px] text-zinc-400">batch convert</span>
				<span class="rounded-md bg-white/5 px-2 py-1 font-mono text-[11px] text-zinc-400">no upload</span>
			</div>
		</div>

		<p v-if="rejected" class="mt-2 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs text-amber-300">
			{{ rejected }}
		</p>

		<div v-if="files.length > 0" class="mt-3 space-y-2">
			<div
				v-for="(file, i) in files"
				:key="`${file.name}-${file.size}-${i}`"
				class="animate-pop-in flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-900/80 px-3 py-2.5"
			>
				<div class="grid size-9 shrink-0 place-items-center rounded-lg bg-lime-400/15 font-mono text-[10px] font-bold text-lime-300">GIF</div>
				<div class="min-w-0 flex-1 leading-tight">
					<p class="truncate text-sm font-medium text-white" :title="file.name">{{ file.name }}</p>
					<p class="font-mono text-[11px] text-zinc-500">{{ formatBytes(file.size) }}</p>
				</div>
				<button
					type="button"
					:disabled="props.disabled"
					class="grid size-8 shrink-0 place-items-center rounded-lg text-zinc-500 transition hover:bg-red-500/15 hover:text-red-400 disabled:opacity-40"
					aria-label="Remove file"
					@click.stop="emit('remove', i)"
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="size-4" aria-hidden="true">
						<path stroke-linecap="round" d="M6 18 18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		</div>
	</div>
</template>
