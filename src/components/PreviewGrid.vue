<script setup lang="ts">
import { ref } from 'vue'
import type { ISpritesheet } from '../types'
import { formatBytes } from '../utils/arrays'

defineProps<{ sheets: ISpritesheet[] }>()

const emit = defineEmits<{
	(e: 'download-image', sheet: ISpritesheet): void
	(e: 'download-json', sheet: ISpritesheet): void
}>()

const openJson = ref<string | null>(null)

function toggleJson(name: string): void {
	openJson.value = openJson.value === name ? null : name
}

function prettyJson(content: string): string {
	try {
		return JSON.stringify(JSON.parse(content), null, 2).slice(0, 4000)
	} catch {
		return content.slice(0, 4000)
	}
}
</script>

<template>
	<div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
		<article
			v-for="(sheet, i) in sheets"
			:key="sheet.image.name + i"
			class="animate-fade-up group overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/70 backdrop-blur transition hover:border-lime-400/40"
			:style="{ animationDelay: `${Math.min(i, 6) * 0.06}s` }"
		>
			<div class="flex items-center justify-between gap-2 border-b border-white/5 px-4 py-3">
				<p class="truncate font-mono text-[13px] font-bold text-white" :title="sheet.image.name">{{ sheet.image.name }}</p>
				<span class="shrink-0 rounded-md bg-lime-400/15 px-2 py-0.5 font-mono text-[11px] font-bold uppercase text-lime-300">
					{{ sheet.meta.format }}
				</span>
			</div>

			<div class="checkerboard thin-scroll max-h-72 overflow-auto p-3">
				<img :src="sheet.url" :alt="`Spritesheet preview for ${sheet.image.name}`" class="mx-auto max-w-none rounded-lg shadow-2xl" loading="lazy" />
			</div>

			<div class="grid grid-cols-4 gap-px border-t border-white/5 bg-white/5 text-center">
				<div class="bg-zinc-900/90 px-1 py-2.5">
					<p class="font-mono text-sm font-extrabold text-white">{{ sheet.meta.frameCount }}</p>
					<p class="text-[10px] uppercase tracking-wider text-zinc-500">frames</p>
				</div>
				<div class="bg-zinc-900/90 px-1 py-2.5">
					<p class="font-mono text-sm font-extrabold text-white">{{ sheet.meta.frameWidth }}×{{ sheet.meta.frameHeight }}</p>
					<p class="text-[10px] uppercase tracking-wider text-zinc-500">frame</p>
				</div>
				<div class="bg-zinc-900/90 px-1 py-2.5">
					<p class="font-mono text-sm font-extrabold text-white">{{ sheet.meta.sheetWidth }}×{{ sheet.meta.sheetHeight }}</p>
					<p class="text-[10px] uppercase tracking-wider text-zinc-500">sheet</p>
				</div>
				<div class="bg-zinc-900/90 px-1 py-2.5">
					<p class="font-mono text-sm font-extrabold text-white">{{ formatBytes(sheet.meta.sizeBytes) }}</p>
					<p class="text-[10px] uppercase tracking-wider text-zinc-500">size</p>
				</div>
			</div>

			<div class="flex gap-2 p-3">
				<button
					type="button"
					class="flex-1 rounded-xl bg-white px-3 py-2 text-[13px] font-extrabold text-zinc-950 transition hover:bg-lime-400"
					@click="emit('download-image', sheet)"
				>
					⤓ Image
				</button>
				<button
					type="button"
					class="flex-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[13px] font-bold text-zinc-100 transition hover:border-white/30 hover:bg-white/10"
					@click="emit('download-json', sheet)"
				>
					{ } JSON
				</button>
				<button
					type="button"
					:aria-expanded="openJson === sheet.image.name"
					class="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[13px] font-bold text-zinc-400 transition hover:text-white"
					@click="toggleJson(sheet.image.name)"
				>
					{{ openJson === sheet.image.name ? '▲' : '▼' }}
				</button>
			</div>

			<div v-if="openJson === sheet.image.name" class="border-t border-white/5 p-3">
				<pre class="thin-scroll max-h-56 overflow-auto rounded-xl bg-zinc-950 p-3 font-mono text-[11px] leading-relaxed text-lime-200/90">{{ prettyJson(sheet.json.content) }}</pre>
			</div>
		</article>
	</div>
</template>
