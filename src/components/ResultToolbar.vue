<script setup lang="ts">
import { computed } from 'vue'
import type { ISpritesheet } from '../types'
import { formatBytes } from '../utils/arrays'

const props = defineProps<{
	sheets: ISpritesheet[]
	zipping: boolean
}>()

const emit = defineEmits<{
	(e: 'download-zip'): void
	(e: 'reset'): void
}>()

const totalFrames = computed(() => props.sheets.reduce((sum, s) => sum + s.meta.frameCount, 0))
const totalBytes = computed(() => props.sheets.reduce((sum, s) => sum + s.meta.sizeBytes, 0))
</script>

<template>
	<div class="flex flex-col gap-3 rounded-2xl border border-lime-400/20 bg-gradient-to-br from-lime-400/10 via-zinc-900 to-zinc-900 p-4 sm:flex-row sm:items-center sm:p-5">
		<div class="flex items-center gap-3">
			<div class="grid size-11 shrink-0 place-items-center rounded-xl bg-lime-400 text-zinc-950">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="size-6" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" d="m5 13 4 4L19 7" />
				</svg>
			</div>
			<div class="leading-tight">
				<p class="font-extrabold text-white">{{ sheets.length }} spritesheet{{ sheets.length > 1 ? 's' : '' }} ready</p>
				<p class="font-mono text-xs text-zinc-400">{{ totalFrames }} frames · {{ formatBytes(totalBytes) }} of images</p>
			</div>
		</div>
		<div class="flex flex-1 flex-col gap-2 sm:flex-row sm:justify-end">
			<button
				type="button"
				class="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold text-zinc-200 transition hover:border-white/30 hover:bg-white/10"
				@click="emit('reset')"
			>
				← Convert more
			</button>
			<button
				type="button"
				:disabled="zipping"
				class="rounded-xl bg-lime-400 px-5 py-2.5 text-sm font-extrabold text-zinc-950 shadow-[0_8px_30px_rgba(163,230,53,0.35)] transition hover:bg-lime-300 disabled:opacity-60"
				@click="emit('download-zip')"
			>
				{{ zipping ? 'Zipping…' : '⤓ Download ZIP (images + JSON)' }}
			</button>
		</div>
	</div>
</template>
