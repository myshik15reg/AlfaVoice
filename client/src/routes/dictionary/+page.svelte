<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import { dictionaryStore, filteredItems, selectedItem } from '$lib/stores/dictionaryStore';
	import { Search } from 'lucide-svelte';

	let searchQuery = '';
	let items: import('$lib/stores/dictionaryStore').NomenclatureItem[] = [];
	let selected: import('$lib/stores/dictionaryStore').NomenclatureItem | null = null;

	// Подписка на filteredItems
	filteredItems.subscribe((value) => {
		items = value;
	});

	// Подписка на selectedItem
	selectedItem.subscribe((value) => {
		selected = value;
	});

	function handleSearch(event: Event) {
		const target = event.target as HTMLInputElement;
		searchQuery = target.value;
		dictionaryStore.setSearchQuery(searchQuery);
	}

	function selectItem(id: string) {
		dictionaryStore.toggleItem(id);
	}

	function formatPrice(price: number): string {
		return price.toFixed(2) + ' ₽';
	}
</script>

<div class="page-container">
	<Header />
	
	<div class="content">
		<div class="dictionary-page">
			<div class="header-section">
				<h1 class="page-title">Словарь номенклатуры</h1>
				<p class="page-subtitle">Выберите товар для работы</p>
			</div>

			<div class="search-section">
				<div class="search-wrapper">
					<Search class="search-icon" size={20} />
					<input
						type="text"
						placeholder="Поиск по названию или коду..."
						class="search-input"
						value={searchQuery}
						on:input={handleSearch}
					/>
				</div>
				{#if searchQuery}
					<div class="search-info">
						Найдено: {items.length} из 20
					</div>
				{/if}
			</div>

			<div class="table-container">
				{#if items.length === 0}
					<div class="empty-state">
						<p>Ничего не найдено</p>
					</div>
				{:else}
					<table class="items-table">
						<thead>
							<tr>
								<th class="col-code">Код</th>
								<th class="col-name">Название</th>
								<th class="col-price">Цена</th>
							</tr>
						</thead>
						<tbody>
							{#each items as item}
								<tr
									class="item-row {selected?.id === item.id ? 'selected' : ''}"
									on:click={() => selectItem(item.id)}
									role="button"
									tabindex="0"
									on:keydown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											selectItem(item.id);
										}
									}}
								>
									<td class="col-code">
										<span class="code-badge">{item.code}</span>
									</td>
									<td class="col-name">{item.name}</td>
									<td class="col-price">{formatPrice(item.price)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				{/if}
			</div>

			{#if selected}
				<div class="selected-info">
					<div class="selected-label">Выбрано:</div>
					<div class="selected-item">
						<strong>{selected.name}</strong>
						<span class="selected-code">({selected.code})</span>
						<span class="selected-price">{formatPrice(selected.price)}</span>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.page-container {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.content {
		margin-top: 1rem;
	}

	.dictionary-page {
		background: white;
		border-radius: 12px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.header-section {
		padding: 1.5rem 2rem;
		border-bottom: 1px solid #e5e7eb;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.page-title {
		font-size: 1.75rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
	}

	.page-subtitle {
		font-size: 0.95rem;
		margin: 0;
		opacity: 0.9;
	}

	.search-section {
		padding: 1.5rem 2rem 1rem 2rem;
		background: #f9fafb;
		border-bottom: 1px solid #e5e7eb;
	}

	.search-wrapper {
		position: relative;
		max-width: 500px;
	}

	.search-icon {
		position: absolute;
		left: 1rem;
		top: 50%;
		transform: translateY(-50%);
		color: #9ca3af;
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		padding: 0.75rem 1rem 0.75rem 3rem;
		border: 2px solid #e5e7eb;
		border-radius: 8px;
		font-size: 0.95rem;
		transition: all 0.2s;
		background: white;
	}

	.search-input:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}

	.search-info {
		margin-top: 0.75rem;
		font-size: 0.875rem;
		color: #6b7280;
	}

	.table-container {
		max-height: 500px;
		overflow-y: auto;
	}

	.empty-state {
		padding: 4rem 2rem;
		text-align: center;
		color: #9ca3af;
		font-size: 1rem;
	}

	.items-table {
		width: 100%;
		border-collapse: collapse;
	}

	.items-table thead {
		position: sticky;
		top: 0;
		background: #f9fafb;
		z-index: 10;
	}

	.items-table th {
		padding: 1rem 1.5rem;
		text-align: left;
		font-weight: 600;
		font-size: 0.875rem;
		color: #374151;
		border-bottom: 2px solid #e5e7eb;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.items-table td {
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #f3f4f6;
	}

	.col-code {
		width: 140px;
	}

	.col-name {
		width: auto;
	}

	.col-price {
		width: 120px;
		text-align: right;
	}

	.code-badge {
		display: inline-block;
		padding: 0.25rem 0.625rem;
		background: #f3f4f6;
		border-radius: 4px;
		font-size: 0.8rem;
		font-family: 'Courier New', monospace;
		font-weight: 600;
		color: #4b5563;
	}

	.item-row {
		cursor: pointer;
		transition: all 0.15s;
	}

	.item-row:hover {
		background: #f9fafb;
	}

	.item-row:focus {
		outline: 2px solid #667eea;
		outline-offset: -2px;
	}

	.item-row.selected {
		background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
		border-left: 4px solid #667eea;
	}

	.item-row.selected .code-badge {
		background: #667eea;
		color: white;
	}

	.selected-info {
		padding: 1.25rem 2rem;
		background: #f0fdf4;
		border-top: 2px solid #22c55e;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.selected-label {
		font-weight: 600;
		color: #15803d;
		font-size: 0.9rem;
		white-space: nowrap;
	}

	.selected-item {
		flex: 1;
		font-size: 0.95rem;
		color: #166534;
	}

	.selected-code {
		margin-left: 0.5rem;
		color: #6b7280;
		font-size: 0.875rem;
	}

	.selected-price {
		margin-left: 0.75rem;
		padding: 0.25rem 0.75rem;
		background: #22c55e;
		color: white;
		border-radius: 4px;
		font-weight: 600;
		font-size: 0.875rem;
	}

	/* Scrollbar styling */
	.table-container::-webkit-scrollbar {
		width: 8px;
	}

	.table-container::-webkit-scrollbar-track {
		background: #f1f1f1;
	}

	.table-container::-webkit-scrollbar-thumb {
		background: #c1c1c1;
		border-radius: 4px;
	}

	.table-container::-webkit-scrollbar-thumb:hover {
		background: #a1a1a1;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.page-container {
			padding: 1rem;
		}

		.header-section {
			padding: 1.25rem 1.5rem;
		}

		.page-title {
			font-size: 1.5rem;
		}

		.search-section {
			padding: 1.25rem 1.5rem;
		}

		.items-table th,
		.items-table td {
			padding: 0.75rem 1rem;
		}

		.col-code {
			width: 100px;
		}

		.col-price {
			width: 100px;
		}

		.selected-info {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}
	}
</style>
