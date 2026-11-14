import { ESCALATION } from '../engine/constants'
import type { Escalation, IndicatorKey } from '../engine/types'

export interface ActionCard {
  title: string
  steps: string[]
}

/** SPEC 4.6: one card per escalation level. Decision support only. */
export const ACTION_LEVEL_CARDS: Record<Escalation['level'], ActionCard> = {
  0: {
    title: 'All clear.',
    steps: ['Keep your daily check-in and exercise routine.'],
  },
  1: {
    title: 'Handle it myself',
    steps: ['Follow the guidance card for the yellow indicator.', 'Re-check tomorrow at check-in.'],
  },
  2: {
    title: 'Alert crew',
    steps: [
      'Notify the Crew Medical Officer (CMO).',
      `Re-measure within ${ESCALATION.remeasureHours} h.`,
      'Log any symptoms in the check-in notes for the CMO.',
    ],
  },
  3: {
    title: 'Contact Earth',
    steps: [
      'Notify the CMO now.',
      'Send the summary to the flight surgeon on Earth.',
      'Follow crew procedures while the reply is in transit.',
    ],
  },
}

/** Level 1 guidance per indicator. General self-care steps, no medical advice. */
export const INDICATOR_GUIDANCE: Record<IndicatorKey, ActionCard> = {
  hr: {
    title: 'Resting heart rate is outside the green range',
    steps: ['Sit and rest for 10 minutes, then re-measure.', 'Drink water if you have not recently.', 'Re-check tomorrow.'],
  },
  bp: {
    title: 'Blood pressure is outside the green range',
    steps: ['Sit quietly for 5 minutes, then re-measure.', 'Measure at the same time of day tomorrow.'],
  },
  glucose: {
    title: 'Fasting glucose is outside the green range',
    steps: ['Confirm the reading was taken fasting.', 'Re-measure fasting tomorrow morning.'],
  },
  temp: {
    title: 'Temperature is outside the green range',
    steps: ['Re-measure in 1 hour.', 'Note any symptoms such as chills or fatigue.', 'Re-check tomorrow.'],
  },
  sleep: {
    title: 'Sleep was short',
    steps: ['Protect a full sleep window tonight.', 'Dim cabin lights and screens before sleep.', 'Re-check tomorrow.'],
  },
  mood: {
    title: 'Mood is lower than usual',
    steps: ['Take private time or talk with a crewmate.', 'Use the crew support plan if it continues.', 'Re-check tomorrow.'],
  },
}
