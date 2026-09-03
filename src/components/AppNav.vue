<template>
	<header class="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl">
		<div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
			<div class="flex items-center gap-3">
				<div class="grid size-10 shrink-0 place-items-center rounded-xl bg-lime-400 text-zinc-950 shadow-[0_0_24px_rgba(163,230,53,0.35)]">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="size-6" aria-hidden="true">
						<rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" stroke="none" />
						<rect x="14" y="3" width="7" height="7" rx="1.5" />
						<rect x="3" y="14" width="7" height="7" rx="1.5" />
						<rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" stroke="none" />
					</svg>
				</div>
				<div class="leading-tight">
					<p class="text-[15px] font-extrabold tracking-tight text-white">
						GIF <span class="text-lime-400">→</span> Spritesheet
					</p>
					<p class="text-xs text-zinc-400">Game-ready sprite sheets + JSON</p>
				</div>
			</div>
			<div class="hidden items-center gap-2 md:flex">
				<span class="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] text-zinc-300">Vue 3 + Vite</span>
				<span class="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] text-zinc-300">100% client-side</span>
				<a
					href="https://github.com"
					target="_blank"
					rel="noreferrer"
					class="rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-zinc-950 transition hover:bg-lime-400"
				>
					★ Star on GitHub
				</a>
			</div>
		</div>
	</header>
</template>
