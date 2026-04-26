import { createCampaignGame, advanceCampaign, chooseCampaignOption } from "./src/campaignState.js";
import { hydrateState, nextPhase, chooseOption, applyStrategicDecision, applyParliamentAction, updateBudgetLine, updateTaxRate } from "./src/state.js";
import { transitionToMandate } from "./src/transitionToMandate.js";
import { bindStaticUi, drawHeroCanvas, fillSetup, hideModal, readSetup, render, setTab, showGame, showSetup, showToast } from "./src/ui.js";
import { skipCampaignAnimation } from "./src/animationSystem.js";
import { LEGACY_SAVE_KEYS, SAVE_KEY, unwrapSave, wrapSave } from "./src/saveSystem.js";

let state = null;

const callbacks = {
  save: () => {
    if (!state) return;
    localStorage.setItem(SAVE_KEY, JSON.stringify(wrapSave(state)));
    state.toast = "Sauvegarde locale effectuee.";
    showToast(state);
  },
  reset: () => {
    localStorage.removeItem(SAVE_KEY);
    LEGACY_SAVE_KEYS.forEach((key) => localStorage.removeItem(key));
    state = null;
    hideModal();
    document.querySelector("#campaignAnimation")?.classList.add("hidden");
    showSetup();
    drawHeroCanvas();
  },
  nextPhase: () => {
    if (!state) return;
    if (state.mode === "campaign" && state.campaign.transitionReady) state = transitionToMandate(state);
    else if (state.mode === "campaign") advanceCampaign(state);
    else nextPhase(state);
    renderAndPersist();
  },
  chooseEvent: (index) => {
    if (!state) return;
    const choice = state.currentEvent.choices[index];
    chooseOption(state, choice, "event");
    renderAndPersist();
  },
  initiative: (id) => {
    if (!state) return;
    applyStrategicDecision(state, id);
    renderAndPersist();
  },
  parliament: (id) => {
    if (!state) return;
    applyParliamentAction(state, id);
    renderAndPersist();
  },
  budget: (id, amount) => {
    if (!state) return;
    updateBudgetLine(state, id, amount);
    renderAndPersist();
  },
  tax: (value) => {
    if (!state) return;
    updateTaxRate(state, value);
    renderAndPersist();
  },
  campaignChoice: (index) => {
    if (!state) return;
    chooseCampaignOption(state, index);
    renderAndPersist();
  },
  enterMandate: () => {
    if (!state || state.mode !== "campaign" || !state.campaign.transitionReady) return;
    state = transitionToMandate(state);
    setTab("dashboard");
    renderAndPersist();
  },
  skipAnimation: () => {
    if (!state) return;
    skipCampaignAnimation(state);
    renderAndPersist();
  }
};

function renderAndPersist() {
  render(state, callbacks);
  showToast(state);
  if (state) localStorage.setItem(SAVE_KEY, JSON.stringify(wrapSave(state)));
}

function startGame(event) {
  event.preventDefault();
  state = createCampaignGame(readSetup());
  showGame();
  setTab("dashboard");
  renderAndPersist();
}

function loadSavedGame() {
  for (const key of [SAVE_KEY, ...LEGACY_SAVE_KEYS]) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const migrated = unwrapSave(JSON.parse(raw));
      const parsed = hydrateState(migrated);
      if (!parsed) continue;
      state = parsed;
      localStorage.setItem(SAVE_KEY, JSON.stringify(wrapSave(state)));
      if (key !== SAVE_KEY) localStorage.removeItem(key);
      showGame();
      setTab("dashboard");
      render(state, callbacks);
      return true;
    } catch {
      localStorage.removeItem(key);
    }
  }
  return false;
}

fillSetup();
bindStaticUi(callbacks);
document.querySelector("#setupForm").addEventListener("submit", startGame);

if (!loadSavedGame()) {
  showSetup();
  drawHeroCanvas();
}
