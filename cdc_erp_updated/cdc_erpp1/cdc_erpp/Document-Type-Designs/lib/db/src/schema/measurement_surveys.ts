import { pgTable, text, serial, timestamp, integer, date, boolean, jsonb } from "drizzle-orm/pg-core";
import { childrenTable } from "./children";
import { centersTable } from "./centers";

export const measurementSurveysTable = pgTable("measurement_surveys", {
  id: serial("id").primaryKey(),
  surveyId: text("survey_id").notNull().unique(),

  centerId: integer("center_id").references(() => centersTable.id),
  childId: integer("child_id").references(() => childrenTable.id),
  enumeratorName: text("enumerator_name"),
  surveyDate: date("survey_date"),

  // Section A: Demographics
  ageGroup: text("age_group"),           // Q1: 9-10 / 11-12 / 13-14 / 15-16 / 17-18
  gender: text("gender"),                // Q2: Male / Female / Other
  educationLevel: text("education_level"), // Q3: 3-12
  detentionLength: text("detention_length"), // Q4
  homeDistrict: text("home_district"),   // Q5

  // Section B: Daily Routine and Activities
  structuredRoutine: text("structured_routine"), // Q6: Always/Sometimes/Rarely/Never
  educationHours: text("education_hours"),        // Q7: 0-1/1-2/2-3/>3
  vocationalHours: text("vocational_hours"),      // Q8
  physicalActivity: text("physical_activity"),    // Q9: Yes daily/Sometimes/Rarely/Never
  readingAccess: boolean("reading_access"),       // Q10
  lifeskillsParticipation: text("lifeskills_participation"), // Q11: Regularly/Occasionally/Rarely/Never
  productiveActivities: boolean("productive_activities"),    // Q12

  // Section C: Institutional Climate and Governance
  complaintOpportunities: boolean("complaint_opportunities"), // Q13
  familyContact: text("family_contact"),                      // Q14: Often/Sometimes/Rarely/Never
  safetyPerception: text("safety_perception"),                // Q15
  physicalPunishment: text("physical_punishment"),            // Q16
  rulesFairness: text("rules_fairness"),                      // Q17
  captainSystem: boolean("captain_system"),                   // Q18

  // Section D: Education and Vocational Opportunities
  formalEducation: boolean("formal_education"),               // Q19
  vocationalAvailable: boolean("vocational_available"),       // Q20
  tradesAvailable: jsonb("trades_available"),                 // Q21: array of selected trades
  vocationalSatisfaction: text("vocational_satisfaction"),    // Q22

  // Section E: Psychosocial Wellbeing
  selfHarm: boolean("self_harm"),                             // Q23
  inmateConflicts: text("inmate_conflicts"),                  // Q24
  emotionalWellbeing: text("emotional_wellbeing"),            // Q25
  hopefulness: text("hopefulness"),                           // Q26

  // Section F: Legal and Case Management
  legalRightsInformed: boolean("legal_rights_informed"),      // Q28
  legalGuidance: text("legal_guidance"),                      // Q29

  // Section G: Open Feedback
  mainChallenges: text("main_challenges"),                    // Q30
  wishedChanges: text("wished_changes"),                      // Q31

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});
