export function moveToNextStep(currentStepNo) {
  try {
    if (window.isUserOnboardingComplete && window.isUserOnboardingComplete() === false) {
      const steveEvent = new window.CustomEvent('steveOnboarding', { detail: { doneStep: currentStepNo } })
      window.dispatchEvent(steveEvent)
    }
  } catch (error) {
    console.error(error)
  }
}

export default {
  moveToNextStep
}
