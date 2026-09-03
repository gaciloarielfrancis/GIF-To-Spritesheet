<script setup lang="ts">
import type { ImageFormat } from '../types'

export interface IOutputOptions {
	width: number
	height: number
	quality: number
	format: ImageFormat
	columns: number
}

const options = defineModel<IOutputOptions>({ required: true })
defineProps<{ disabled?: boolean }>()

const formats: { value: ImageFormat; label: string; hint: string }[] = [
	{ value: 'png', label: 'PNG', hint: 'lossless' },
	{ value: 'jpeg', label: 'JPEG', hint: 'smaller' },
	{ value: 'webp', label: 'WEBP', hint: 'modern' },
]

function sliderFill(value: number, min: number, max: number): string {
	const pct = ((value - min) / (max - min)) * 100
	return `${pct}%`
}
</script>

<template>
	<div class="space-y-5">
		<div>
			<div class="mb-2 flex items-center justify-between">
				<label class="text-xs font-bold uppercase tracking-widest text-zinc-400">Frame size</label>
				<span class="font-mono text-[11px] text-zinc-500">0 = auto</span>
			</div>
			<div class="grid grid-cols-2 gap-2.5">
				<label class="block rounded-xl border border-white/10 bg-zinc-900/70 px-3 py-2.5 transition focus-within:border-lime-400/60">
					<span class="mb-1 block text-[11px] font-semibold text-zinc-400">Width (px)</span>
					<input
						v-model.number="options.width"
						type="number"
						min="0"
						max="4096"
						placeholder="Auto"
						:disabled="disabled"
						class="w-full bg-transparent text-lg font-bold text-white outline-none placeholder:text-zinc-600 disabled:opacity-50"
					/>
				</label>
				<label class="block rounded-xl border border-white/10 bg-zinc-900/70 px-3 py-2.5 transition focus-within:border-lime-400/60">
					<span class="mb-1 block text-[11px] font-semibold text-zinc-400">Height (px)</span>
					<input
						v-model.number="options.height"
						type="number"
						min="0"
						max="4096"
						placeholder="Auto"
						:disabled="disabled"
						class="w-full bg-transparent text-lg font-bold text-white outline-none placeholder:text-zinc-600 disabled:opacity-50"
					/>
				</label>
			</div>
			<p class="mt-1.5 text-[11px] leading-relaxed text-zinc-500">
				Set one side to keep aspect ratio · set both to force · leave both at 0 for original size.
			</p>
		</div>

		<div>
			<div class="mb-2 flex items-center justify-between">
				<label for="quality" class="text-xs font-bold uppercase tracking-widest text-zinc-400">Quality</label>
				<span class="rounded-md bg-lime-400/15 px-2 py-0.5 font-mono text-xs font-bold text-lime-300">{{ options.quality }}%</span>
			</div>
			<input
				id="quality"
				v-model.number="options.quality"
				type="range"
				min="1"
				max="100"
				:disabled="disabled"
				:style="{ '--fill': sliderFill(options.quality, 1, 100) }"
				class="w-full disabled:opacity-50"
			/>
			<div class="mt-1 flex justify-between font-mono text-[10px] text-zinc-600">
				<span>1 · small file</span><span>100 · best</span>
			</div>
		</div>

		<div>
			<span class="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-400">Format</span>
			<div class="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Output format">
				<button
					v-for="f in formats"
					:key="f.value"
					type="button"
					role="radio"
					:aria-checked="options.format === f.value"
					:disabled="disabled"
					:class="[
						'rounded-xl border px-2 py-2.5 text-center transition disabled:opacity-50',
						options.format === f.value
							? 'border-lime-400 bg-lime-400/15 text-white shadow-[0_0_18px_rgba(163,230,53,0.15)]'
							: 'border-white/10 bg-zinc-900/70 text-zinc-400 hover:border-white/25 hover:text-white',
					]"
					@click="options.format = f.value"
				>
					<span class="block text-sm font-extrabold tracking-wide">{{ f.label }}</span>
					<span class="block text-[11px] opacity-70">{{ f.hint }}</span>
				</button>
			</div>
		</div>

		<div>
			<div class="mb-2 flex items-center justify-between">
				<label for="columns" class="text-xs font-bold uppercase tracking-widest text-zinc-400">Columns</label>
				<span class="rounded-md bg-white/5 px-2 py-0.5 font-mono text-xs font-bold text-zinc-200">{{ options.columns }} / row</span>
			</div>
			<input
				id="columns"
				v-model.number="options.columns"
				type="range"
				min="1"
				max="10"
				:disabled="disabled"
				:style="{ '--fill': sliderFill(options.columns, 1, 10) }"
				class="w-full disabled:opacity-50"
			/>
			<p class="mt-1.5 text-[11px] text-zinc-500">Frames are packed left → right, top → bottom (max 10, as before).</p>
		</div>
	</div>
</template>
