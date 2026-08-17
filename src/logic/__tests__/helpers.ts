import type { Food } from '../../data/foods';

/** テスト用の食材を作る(必要な項目だけ上書き) */
export function food(overrides: Partial<Food>): Food {
  return {
    id: 'test-id',
    name: 'テスト食材',
    nature: '平',
    flavors: ['甘'],
    meridians: '脾・胃',
    cat15: 'yasai',
    cat5: 'veg',
    note: '',
    icon: 'yasai',
    catIcon: 'cat_yasai',
    ...overrides,
  };
}
