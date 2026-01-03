import { writable, derived } from 'svelte/store';

export interface NomenclatureItem {
	id: string;
	name: string;
	code: string;
	price: number;
}

interface DictionaryState {
	items: NomenclatureItem[];
	searchQuery: string;
	selectedId: string | null;
}

// Mock данные - 20 товаров
const MOCK_ITEMS: NomenclatureItem[] = [
	{ id: '1', name: 'Молоко 3.2%', code: 'MLK001', price: 89.90 },
	{ id: '2', name: 'Хлеб белый', code: 'BRD001', price: 45.00 },
	{ id: '3', name: 'Хлеб ржаной', code: 'BRD002', price: 52.00 },
	{ id: '4', name: 'Сыр Российский', code: 'CHR001', price: 320.00 },
	{ id: '5', name: 'Масло сливочное', code: 'BTR001', price: 189.00 },
	{ id: '6', name: 'Яйца куриные 10шт', code: 'EGG001', price: 95.00 },
	{ id: '7', name: 'Сахар песок', code: 'SGR001', price: 78.00 },
	{ id: '8', name: 'Соль поваренная', code: 'SLT001', price: 25.00 },
	{ id: '9', name: 'Мука пшеничная', code: 'FLR001', price: 65.00 },
	{ id: '10', name: 'Рис длиннозерный', code: 'RCE001', price: 110.00 },
	{ id: '11', name: 'Гречка', code: 'BCK001', price: 125.00 },
	{ id: '12', name: 'Макароны', code: 'PST001', price: 95.00 },
	{ id: '13', name: 'Чай черный', code: 'TEA001', price: 145.00 },
	{ id: '14', name: 'Кофе растворимый', code: 'CFF001', price: 289.00 },
	{ id: '15', name: 'Какао-порошок', code: 'CAC001', price: 198.00 },
	{ id: '16', name: 'Сок апельсиновый', code: 'JCE001', price: 135.00 },
	{ id: '17', name: 'Сок яблочный', code: 'JCE002', price: 120.00 },
	{ id: '18', name: 'Вода минеральная', code: 'WTR001', price: 55.00 },
	{ id: '19', name: 'Кефир 2.5%', code: 'KFR001', price: 75.00 },
	{ id: '20', name: 'Сметана 20%', code: 'CRM001', price: 85.00 }
];

function createDictionaryStore() {
	const initialState: DictionaryState = {
		items: MOCK_ITEMS,
		searchQuery: '',
		selectedId: null
	};

	const { subscribe, set, update } = writable<DictionaryState>(initialState);

	return {
		subscribe,
		
		setSearchQuery: (query: string) => {
			update((state) => ({
				...state,
				searchQuery: query.toLowerCase()
			}));
		},
		
		selectItem: (id: string | null) => {
			update((state) => ({
				...state,
				selectedId: id
			}));
		},
		
		toggleItem: (id: string) => {
			update((state) => ({
				...state,
				selectedId: state.selectedId === id ? null : id
			}));
		},
		
		reset: () => {
			set(initialState);
		}
	};
}

export const dictionaryStore = createDictionaryStore();

// Derived store для отфильтрованных товаров
export const filteredItems = derived(
	dictionaryStore,
	($state) => {
		if (!$state.searchQuery) {
			return $state.items;
		}
		
		return $state.items.filter((item) => 
			item.name.toLowerCase().includes($state.searchQuery) ||
			item.code.toLowerCase().includes($state.searchQuery)
		);
	}
);

// Derived store для выбранного товара
export const selectedItem = derived(
	dictionaryStore,
	($state) => {
		if (!$state.selectedId) {
			return null;
		}
		return $state.items.find((item) => item.id === $state.selectedId) || null;
	}
);
