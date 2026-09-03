<script setup lang="ts">
import type { IConverterProgress } from '../types'

defineProps<{
	processing: boolean
	progress: IConverterProgress
}>()
</script>

<template>
	<Teleport to="body">
		<Transition name="fade">
			<div
				v-if="processing"
				class="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 p-4 backdrop-blur-md"
				role="status"
				aria-live="polite"
			>
				<div class="animate-pop-in w-full max-w-sm rounded-3xl border border-white/10 bg-zinc-900 p-8 text-center shadow-2xl">
					<div class="relative mx-auto size-20">
						<div class="spinner-ring absolute inset-0 rounded-full"></div>
						<div class="absolute inset-2 grid place-items-center rounded-full bg-zinc-900">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="size-8 text-lime-400" aria-hidden="true">
								<rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" stroke="none" />
								<rect x="14" y="3" width="7" height="7" rx="1.5" />
								<rect x="3" y="14" width="7" height="7" rx="1.5" />
								<rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" stroke="none" />
							</svg>
						</div>
					</div>
					<p class="mt-5 font-extrabold text-white">Building spritesheets…</p>
					<p class="mt-1 min-h-5 text-sm text-zinc-400">
						{{ progress.stage }}<span v-if="progress.fileName"> · {{ progress.fileName }}</span>
					</p>
					<div class="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
						<div
							class="h-full rounded-full bg-gradient-to-r from-lime-500 to-lime-300 transition-all duration-300"
							:style="{ width: progress.total > 0 ? `${(progress.current / progress.total) * 100}%` : '30%' }"
						></div>
					</div>
					<p v-if="progress.total > 1" class="mt-2 font-mono text-xs text-zinc-500">
						{{ progress.current }} / {{ progress.total }} files
					</p>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
