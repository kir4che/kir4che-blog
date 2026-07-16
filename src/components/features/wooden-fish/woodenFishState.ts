interface Merit {
  id: number;
  lane: 0 | 1 | 2;
}

interface MeritState {
  merits: Merit[];
  nextId: number;
}

export const INITIAL_MERIT_STATE: MeritState = { merits: [], nextId: 0 };

export const addMerit = (state: MeritState): MeritState => ({
  merits: [...state.merits, { id: state.nextId, lane: (state.nextId % 3) as Merit['lane'] }],
  nextId: state.nextId + 1,
});

export const removeMerit = (state: MeritState, id: number): MeritState => ({
  ...state,
  merits: state.merits.filter((merit) => merit.id !== id),
});
