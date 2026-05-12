--
-- PostgreSQL database dump
--

\restrict hY7YziTbbQr1GtRsUz2mG5rKQLmCzgHtO1z0M2FG3yJVVjtbOzwlPlfmrcZvlaB

-- Dumped from database version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.workflow_logs DROP CONSTRAINT IF EXISTS workflow_logs_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_role_id_roles_id_fk;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_center_id_centers_id_fk;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_administrative_unit_id_administrative_units_id_fk;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_role_id_roles_id_fk;
ALTER TABLE IF EXISTS ONLY public.role_center_access DROP CONSTRAINT IF EXISTS role_center_access_role_id_roles_id_fk;
ALTER TABLE IF EXISTS ONLY public.role_center_access DROP CONSTRAINT IF EXISTS role_center_access_center_id_centers_id_fk;
ALTER TABLE IF EXISTS ONLY public.risk_assessments DROP CONSTRAINT IF EXISTS risk_assessments_child_id_children_id_fk;
ALTER TABLE IF EXISTS ONLY public.release_records DROP CONSTRAINT IF EXISTS release_records_child_id_children_id_fk;
ALTER TABLE IF EXISTS ONLY public.police_acquisitions DROP CONSTRAINT IF EXISTS police_acquisitions_child_id_children_id_fk;
ALTER TABLE IF EXISTS ONLY public.measurement_surveys DROP CONSTRAINT IF EXISTS measurement_surveys_child_id_children_id_fk;
ALTER TABLE IF EXISTS ONLY public.measurement_surveys DROP CONSTRAINT IF EXISTS measurement_surveys_center_id_centers_id_fk;
ALTER TABLE IF EXISTS ONLY public.health_assessments DROP CONSTRAINT IF EXISTS health_assessments_child_id_children_id_fk;
ALTER TABLE IF EXISTS ONLY public.guardians DROP CONSTRAINT IF EXISTS guardians_child_id_children_id_fk;
ALTER TABLE IF EXISTS ONLY public.guardian_visits DROP CONSTRAINT IF EXISTS guardian_visits_guardian_id_guardians_id_fk;
ALTER TABLE IF EXISTS ONLY public.guardian_visits DROP CONSTRAINT IF EXISTS guardian_visits_child_id_children_id_fk;
ALTER TABLE IF EXISTS ONLY public.follow_ups DROP CONSTRAINT IF EXISTS follow_ups_child_id_children_id_fk;
ALTER TABLE IF EXISTS ONLY public.family_socioeconomic_records DROP CONSTRAINT IF EXISTS family_socioeconomic_records_child_id_children_id_fk;
ALTER TABLE IF EXISTS ONLY public.education_plans DROP CONSTRAINT IF EXISTS education_plans_child_id_children_id_fk;
ALTER TABLE IF EXISTS ONLY public.court_cases DROP CONSTRAINT IF EXISTS court_cases_child_id_children_id_fk;
ALTER TABLE IF EXISTS ONLY public.counseling_sessions DROP CONSTRAINT IF EXISTS counseling_sessions_child_id_children_id_fk;
ALTER TABLE IF EXISTS ONLY public.children DROP CONSTRAINT IF EXISTS children_center_id_centers_id_fk;
ALTER TABLE IF EXISTS ONLY public.cases DROP CONSTRAINT IF EXISTS cases_child_id_children_id_fk;
ALTER TABLE IF EXISTS ONLY public.case_risk_assessments DROP CONSTRAINT IF EXISTS case_risk_assessments_case_id_cases_id_fk;
ALTER TABLE IF EXISTS ONLY public.case_intervention_plans DROP CONSTRAINT IF EXISTS case_intervention_plans_case_id_cases_id_fk;
ALTER TABLE IF EXISTS ONLY public.case_detail_assessments DROP CONSTRAINT IF EXISTS case_detail_assessments_case_id_cases_id_fk;
ALTER TABLE IF EXISTS ONLY public.case_agreements DROP CONSTRAINT IF EXISTS case_agreements_case_id_cases_id_fk;
ALTER TABLE IF EXISTS ONLY public.admissions DROP CONSTRAINT IF EXISTS admissions_child_id_children_id_fk;
ALTER TABLE IF EXISTS ONLY public.admissions DROP CONSTRAINT IF EXISTS admissions_center_id_centers_id_fk;
ALTER TABLE IF EXISTS ONLY public.administrative_units DROP CONSTRAINT IF EXISTS administrative_units_linked_center_id_centers_id_fk;
ALTER TABLE IF EXISTS ONLY public.workflow_logs DROP CONSTRAINT IF EXISTS workflow_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_username_unique;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.trainings DROP CONSTRAINT IF EXISTS trainings_pkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_role_name_unique;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_pkey;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_role_module_unique;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.role_center_access DROP CONSTRAINT IF EXISTS role_center_access_role_center_unique;
ALTER TABLE IF EXISTS ONLY public.role_center_access DROP CONSTRAINT IF EXISTS role_center_access_pkey;
ALTER TABLE IF EXISTS ONLY public.risk_assessments DROP CONSTRAINT IF EXISTS risk_assessments_risk_id_unique;
ALTER TABLE IF EXISTS ONLY public.risk_assessments DROP CONSTRAINT IF EXISTS risk_assessments_pkey;
ALTER TABLE IF EXISTS ONLY public.release_records DROP CONSTRAINT IF EXISTS release_records_release_id_unique;
ALTER TABLE IF EXISTS ONLY public.release_records DROP CONSTRAINT IF EXISTS release_records_pkey;
ALTER TABLE IF EXISTS ONLY public.police_acquisitions DROP CONSTRAINT IF EXISTS police_acquisitions_pkey;
ALTER TABLE IF EXISTS ONLY public.police_acquisitions DROP CONSTRAINT IF EXISTS police_acquisitions_acquisition_id_unique;
ALTER TABLE IF EXISTS ONLY public.measurement_surveys DROP CONSTRAINT IF EXISTS measurement_surveys_survey_id_unique;
ALTER TABLE IF EXISTS ONLY public.measurement_surveys DROP CONSTRAINT IF EXISTS measurement_surveys_pkey;
ALTER TABLE IF EXISTS ONLY public.health_assessments DROP CONSTRAINT IF EXISTS health_assessments_pkey;
ALTER TABLE IF EXISTS ONLY public.health_assessments DROP CONSTRAINT IF EXISTS health_assessments_assessment_id_unique;
ALTER TABLE IF EXISTS ONLY public.guardians DROP CONSTRAINT IF EXISTS guardians_pkey;
ALTER TABLE IF EXISTS ONLY public.guardians DROP CONSTRAINT IF EXISTS guardians_guardian_id_unique;
ALTER TABLE IF EXISTS ONLY public.guardian_visits DROP CONSTRAINT IF EXISTS guardian_visits_visit_id_unique;
ALTER TABLE IF EXISTS ONLY public.guardian_visits DROP CONSTRAINT IF EXISTS guardian_visits_pkey;
ALTER TABLE IF EXISTS ONLY public.follow_ups DROP CONSTRAINT IF EXISTS follow_ups_pkey;
ALTER TABLE IF EXISTS ONLY public.follow_ups DROP CONSTRAINT IF EXISTS follow_ups_follow_up_id_unique;
ALTER TABLE IF EXISTS ONLY public.family_types DROP CONSTRAINT IF EXISTS family_types_pkey;
ALTER TABLE IF EXISTS ONLY public.family_socioeconomic_records DROP CONSTRAINT IF EXISTS family_socioeconomic_records_record_id_unique;
ALTER TABLE IF EXISTS ONLY public.family_socioeconomic_records DROP CONSTRAINT IF EXISTS family_socioeconomic_records_pkey;
ALTER TABLE IF EXISTS ONLY public.education_plans DROP CONSTRAINT IF EXISTS education_plans_plan_id_unique;
ALTER TABLE IF EXISTS ONLY public.education_plans DROP CONSTRAINT IF EXISTS education_plans_pkey;
ALTER TABLE IF EXISTS ONLY public.court_cases DROP CONSTRAINT IF EXISTS court_cases_pkey;
ALTER TABLE IF EXISTS ONLY public.court_cases DROP CONSTRAINT IF EXISTS court_cases_court_case_id_unique;
ALTER TABLE IF EXISTS ONLY public.counseling_sessions DROP CONSTRAINT IF EXISTS counseling_sessions_session_id_unique;
ALTER TABLE IF EXISTS ONLY public.counseling_sessions DROP CONSTRAINT IF EXISTS counseling_sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.classes DROP CONSTRAINT IF EXISTS classes_pkey;
ALTER TABLE IF EXISTS ONLY public.children DROP CONSTRAINT IF EXISTS children_pkey;
ALTER TABLE IF EXISTS ONLY public.children DROP CONSTRAINT IF EXISTS children_child_id_unique;
ALTER TABLE IF EXISTS ONLY public.centers DROP CONSTRAINT IF EXISTS centers_pkey;
ALTER TABLE IF EXISTS ONLY public.centers DROP CONSTRAINT IF EXISTS centers_center_name_unique;
ALTER TABLE IF EXISTS ONLY public.cases DROP CONSTRAINT IF EXISTS cases_pkey;
ALTER TABLE IF EXISTS ONLY public.cases DROP CONSTRAINT IF EXISTS cases_case_id_unique;
ALTER TABLE IF EXISTS ONLY public.case_types DROP CONSTRAINT IF EXISTS case_types_pkey;
ALTER TABLE IF EXISTS ONLY public.case_risk_assessments DROP CONSTRAINT IF EXISTS case_risk_assessments_pkey;
ALTER TABLE IF EXISTS ONLY public.case_intervention_plans DROP CONSTRAINT IF EXISTS case_intervention_plans_pkey;
ALTER TABLE IF EXISTS ONLY public.case_detail_assessments DROP CONSTRAINT IF EXISTS case_detail_assessments_pkey;
ALTER TABLE IF EXISTS ONLY public.case_agreements DROP CONSTRAINT IF EXISTS case_agreements_pkey;
ALTER TABLE IF EXISTS ONLY public.admissions DROP CONSTRAINT IF EXISTS admissions_pkey;
ALTER TABLE IF EXISTS ONLY public.admissions DROP CONSTRAINT IF EXISTS admissions_admission_id_unique;
ALTER TABLE IF EXISTS ONLY public.administrative_units DROP CONSTRAINT IF EXISTS administrative_units_pkey;
ALTER TABLE IF EXISTS public.workflow_logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.trainings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.roles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.role_permissions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.role_center_access ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.risk_assessments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.release_records ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.police_acquisitions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.measurement_surveys ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.health_assessments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.guardians ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.guardian_visits ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.follow_ups ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.family_types ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.family_socioeconomic_records ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.education_plans ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.court_cases ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.counseling_sessions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.classes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.children ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.centers ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.cases ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.case_types ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.case_risk_assessments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.case_intervention_plans ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.case_detail_assessments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.case_agreements ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.admissions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.administrative_units ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.workflow_logs_id_seq;
DROP TABLE IF EXISTS public.workflow_logs;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.trainings_id_seq;
DROP TABLE IF EXISTS public.trainings;
DROP SEQUENCE IF EXISTS public.roles_id_seq;
DROP TABLE IF EXISTS public.roles;
DROP SEQUENCE IF EXISTS public.role_permissions_id_seq;
DROP TABLE IF EXISTS public.role_permissions;
DROP SEQUENCE IF EXISTS public.role_center_access_id_seq;
DROP TABLE IF EXISTS public.role_center_access;
DROP SEQUENCE IF EXISTS public.risk_assessments_id_seq;
DROP TABLE IF EXISTS public.risk_assessments;
DROP SEQUENCE IF EXISTS public.release_records_id_seq;
DROP TABLE IF EXISTS public.release_records;
DROP SEQUENCE IF EXISTS public.police_acquisitions_id_seq;
DROP TABLE IF EXISTS public.police_acquisitions;
DROP SEQUENCE IF EXISTS public.measurement_surveys_id_seq;
DROP TABLE IF EXISTS public.measurement_surveys;
DROP SEQUENCE IF EXISTS public.health_assessments_id_seq;
DROP TABLE IF EXISTS public.health_assessments;
DROP SEQUENCE IF EXISTS public.guardians_id_seq;
DROP TABLE IF EXISTS public.guardians;
DROP SEQUENCE IF EXISTS public.guardian_visits_id_seq;
DROP TABLE IF EXISTS public.guardian_visits;
DROP SEQUENCE IF EXISTS public.follow_ups_id_seq;
DROP TABLE IF EXISTS public.follow_ups;
DROP SEQUENCE IF EXISTS public.family_types_id_seq;
DROP TABLE IF EXISTS public.family_types;
DROP SEQUENCE IF EXISTS public.family_socioeconomic_records_id_seq;
DROP TABLE IF EXISTS public.family_socioeconomic_records;
DROP SEQUENCE IF EXISTS public.education_plans_id_seq;
DROP TABLE IF EXISTS public.education_plans;
DROP SEQUENCE IF EXISTS public.court_cases_id_seq;
DROP TABLE IF EXISTS public.court_cases;
DROP SEQUENCE IF EXISTS public.counseling_sessions_id_seq;
DROP TABLE IF EXISTS public.counseling_sessions;
DROP SEQUENCE IF EXISTS public.classes_id_seq;
DROP TABLE IF EXISTS public.classes;
DROP SEQUENCE IF EXISTS public.children_id_seq;
DROP TABLE IF EXISTS public.children;
DROP SEQUENCE IF EXISTS public.centers_id_seq;
DROP TABLE IF EXISTS public.centers;
DROP SEQUENCE IF EXISTS public.cases_id_seq;
DROP TABLE IF EXISTS public.cases;
DROP SEQUENCE IF EXISTS public.case_types_id_seq;
DROP TABLE IF EXISTS public.case_types;
DROP SEQUENCE IF EXISTS public.case_risk_assessments_id_seq;
DROP TABLE IF EXISTS public.case_risk_assessments;
DROP SEQUENCE IF EXISTS public.case_intervention_plans_id_seq;
DROP TABLE IF EXISTS public.case_intervention_plans;
DROP SEQUENCE IF EXISTS public.case_detail_assessments_id_seq;
DROP TABLE IF EXISTS public.case_detail_assessments;
DROP SEQUENCE IF EXISTS public.case_agreements_id_seq;
DROP TABLE IF EXISTS public.case_agreements;
DROP SEQUENCE IF EXISTS public.admissions_id_seq;
DROP TABLE IF EXISTS public.admissions;
DROP SEQUENCE IF EXISTS public.administrative_units_id_seq;
DROP TABLE IF EXISTS public.administrative_units;
DROP TYPE IF EXISTS public.child_gender;
--
-- Name: child_gender; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.child_gender AS ENUM (
    'Boy',
    'Girl',
    'Others'
);


ALTER TYPE public.child_gender OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: administrative_units; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.administrative_units (
    id integer NOT NULL,
    unit_name text NOT NULL,
    unit_name_bn text,
    unit_name_en text,
    unit_type text NOT NULL,
    parent_unit_id integer,
    linked_center_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.administrative_units OWNER TO postgres;

--
-- Name: administrative_units_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.administrative_units_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.administrative_units_id_seq OWNER TO postgres;

--
-- Name: administrative_units_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.administrative_units_id_seq OWNED BY public.administrative_units.id;


--
-- Name: admissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admissions (
    id integer NOT NULL,
    admission_id text NOT NULL,
    child_id integer NOT NULL,
    center_id integer NOT NULL,
    admission_date date NOT NULL,
    admission_time text,
    admission_source text NOT NULL,
    receiving_officer text,
    documents_verified boolean DEFAULT false,
    verified_by text,
    verification_date date,
    approval_status text DEFAULT 'Draft'::text NOT NULL,
    authority_remarks text,
    cw_feedback text,
    po_feedback text,
    rejection_note text,
    approved_by_name text,
    rejected_by_name text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.admissions OWNER TO postgres;

--
-- Name: admissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admissions_id_seq OWNER TO postgres;

--
-- Name: admissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admissions_id_seq OWNED BY public.admissions.id;


--
-- Name: case_agreements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.case_agreements (
    id integer NOT NULL,
    case_id integer NOT NULL,
    registration_no text,
    child_name_at_agreement text,
    father_name_at_agreement text,
    mother_name_at_agreement text,
    age_at_agreement integer,
    gender_at_agreement text,
    religion_at_agreement text,
    current_address_at_agreement text,
    permanent_address_at_agreement text,
    guardian_info text,
    witness_names text,
    agreement_date date,
    social_worker_signature text,
    officer_signature text,
    guardian_signature text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.case_agreements OWNER TO postgres;

--
-- Name: case_agreements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.case_agreements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.case_agreements_id_seq OWNER TO postgres;

--
-- Name: case_agreements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.case_agreements_id_seq OWNED BY public.case_agreements.id;


--
-- Name: case_detail_assessments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.case_detail_assessments (
    id integer NOT NULL,
    case_id integer NOT NULL,
    court_order_details text,
    assessment_reason text,
    family_members text,
    current_living_situation text,
    previous_services text,
    child_domain_scores text,
    parent_capacity_scores text,
    environment_scores text,
    conclusion_reason text,
    overall_comments text,
    changes_needed text,
    child_opinion text,
    parent_opinion text,
    assessed_by text,
    assessor_designation text,
    assessed_at date,
    parent_signature text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.case_detail_assessments OWNER TO postgres;

--
-- Name: case_detail_assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.case_detail_assessments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.case_detail_assessments_id_seq OWNER TO postgres;

--
-- Name: case_detail_assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.case_detail_assessments_id_seq OWNED BY public.case_detail_assessments.id;


--
-- Name: case_intervention_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.case_intervention_plans (
    id integer NOT NULL,
    case_id integer NOT NULL,
    change_needed text,
    activities text,
    how_to_know_improvement text,
    child_opinion text,
    parent_opinion text,
    plan_date date,
    next_review_date date,
    parent_signature text,
    social_worker_signature text,
    attendees_names text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.case_intervention_plans OWNER TO postgres;

--
-- Name: case_intervention_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.case_intervention_plans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.case_intervention_plans_id_seq OWNER TO postgres;

--
-- Name: case_intervention_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.case_intervention_plans_id_seq OWNED BY public.case_intervention_plans.id;


--
-- Name: case_risk_assessments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.case_risk_assessments (
    id integer NOT NULL,
    case_id integer NOT NULL,
    domain_scores text,
    total_score integer,
    assessed_by text,
    assessor_designation text,
    assessed_at date,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.case_risk_assessments OWNER TO postgres;

--
-- Name: case_risk_assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.case_risk_assessments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.case_risk_assessments_id_seq OWNER TO postgres;

--
-- Name: case_risk_assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.case_risk_assessments_id_seq OWNED BY public.case_risk_assessments.id;


--
-- Name: case_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.case_types (
    id integer NOT NULL,
    name_bn text NOT NULL,
    name_en text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.case_types OWNER TO postgres;

--
-- Name: case_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.case_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.case_types_id_seq OWNER TO postgres;

--
-- Name: case_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.case_types_id_seq OWNED BY public.case_types.id;


--
-- Name: cases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cases (
    id integer NOT NULL,
    case_id text NOT NULL,
    child_id integer NOT NULL,
    case_opening_date date,
    assigned_case_worker text,
    risk_level text,
    case_status text DEFAULT 'Open'::text NOT NULL,
    case_type text,
    case_summary text,
    investigation_notes text,
    recommendation text,
    center_id integer,
    is_special_case boolean DEFAULT false NOT NULL,
    is_priority_case boolean DEFAULT false NOT NULL,
    workflow_state text DEFAULT 'Draft'::text NOT NULL,
    workflow_notes text,
    sent_back_notes text,
    submitted_by_id integer,
    reviewed_by_df_id integer,
    reviewed_by_caseworker_id integer,
    reviewed_by_probation_id integer,
    approved_by_id integer,
    registration_number text,
    name_english text,
    mother_name text,
    father_name text,
    guardian_name text,
    guardian_relationship text,
    birth_reg_no text,
    disability_id text,
    nationality text,
    ethnicity text,
    birthplace text,
    religion text,
    occupation text,
    income text,
    current_address_division text,
    current_address_district text,
    current_address_upazila text,
    current_address_union text,
    current_address_village text,
    permanent_address_division text,
    permanent_address_district text,
    permanent_address_upazila text,
    permanent_address_union text,
    permanent_address_village text,
    guardian_phone text,
    email text,
    living_with text,
    child_problems text,
    other_problems text,
    referral_reason text,
    referral_contact_name text,
    referral_contact_address text,
    referral_contact_phone text,
    referral_relationship text,
    urgent_service_needed boolean,
    urgent_service_types text,
    referral_destination text,
    receiver_name text,
    receiver_id_no text,
    intake_date date,
    intake_officer_name text,
    intake_officer_designation text,
    assessor_name text,
    supervisor_name text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.cases OWNER TO postgres;

--
-- Name: cases_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cases_id_seq OWNER TO postgres;

--
-- Name: cases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cases_id_seq OWNED BY public.cases.id;


--
-- Name: centers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.centers (
    id integer NOT NULL,
    center_name text NOT NULL,
    center_name_bn text,
    center_type text NOT NULL,
    location text,
    address text,
    is_hq text DEFAULT 'no'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.centers OWNER TO postgres;

--
-- Name: centers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.centers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.centers_id_seq OWNER TO postgres;

--
-- Name: centers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.centers_id_seq OWNED BY public.centers.id;


--
-- Name: children; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.children (
    id integer NOT NULL,
    child_id text NOT NULL,
    center_id integer,
    full_name text NOT NULL,
    mother_name text,
    father_name text,
    gender public.child_gender,
    date_of_birth date,
    age_at_admission integer,
    verified_age integer,
    verified_age_date date,
    verified_dob date,
    birth_registration_no text,
    birth_certificate_file_name text,
    birth_certificate_file_data_url text,
    profile_image_file_name text,
    profile_image_data_url text,
    religion text,
    nationality text,
    present_division text,
    present_district text,
    present_upazila text,
    present_village text,
    present_address text,
    permanent_division text,
    permanent_district text,
    permanent_upazila text,
    permanent_village text,
    permanent_address text,
    admission_date date NOT NULL,
    arrival_district text,
    admission_source text NOT NULL,
    legal_context text,
    judicial_status text,
    education_level text,
    skills text,
    future_goal text,
    child_risk text,
    parents_education text,
    parents_occupation text,
    parents_monthly_income integer,
    socioeconomic_status text,
    parents_contact_number text,
    child_relationship_with_parents text,
    siblings_count_and_order text,
    is_married boolean DEFAULT false NOT NULL,
    children_count integer,
    family_type text,
    parents_marital_status text,
    guardian_type text,
    is_orphan boolean DEFAULT false NOT NULL,
    family_member_substance_abuse boolean DEFAULT false NOT NULL,
    family_criminal_involvement boolean DEFAULT false NOT NULL,
    peer_circle_info text,
    basic_needs_fulfilled boolean DEFAULT false NOT NULL,
    basic_needs_note text,
    safety_ensured boolean DEFAULT false NOT NULL,
    safety_ensured_note text,
    initial_health_check_completed boolean DEFAULT false NOT NULL,
    initial_health_check_note text,
    court_reference_no text,
    case_type text,
    current_status text DEFAULT 'Admitted'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.children OWNER TO postgres;

--
-- Name: children_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.children_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.children_id_seq OWNER TO postgres;

--
-- Name: children_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.children_id_seq OWNED BY public.children.id;


--
-- Name: classes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.classes (
    id integer NOT NULL,
    name_bn text NOT NULL,
    name_en text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.classes OWNER TO postgres;

--
-- Name: classes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.classes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.classes_id_seq OWNER TO postgres;

--
-- Name: classes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.classes_id_seq OWNED BY public.classes.id;


--
-- Name: counseling_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.counseling_sessions (
    id integer NOT NULL,
    session_id text NOT NULL,
    child_id integer NOT NULL,
    session_date date NOT NULL,
    counselor text,
    session_type text NOT NULL,
    issues_discussed text,
    observations text,
    outcome text,
    next_session_date date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.counseling_sessions OWNER TO postgres;

--
-- Name: counseling_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.counseling_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.counseling_sessions_id_seq OWNER TO postgres;

--
-- Name: counseling_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.counseling_sessions_id_seq OWNED BY public.counseling_sessions.id;


--
-- Name: court_cases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.court_cases (
    id integer NOT NULL,
    court_case_id text NOT NULL,
    child_id integer NOT NULL,
    court_name text NOT NULL,
    police_station_name text,
    gr_number text,
    case_no text NOT NULL,
    legal_section text,
    legal_aid_type text,
    hearing_date date,
    last_hearing_date date,
    lawyer_name text,
    child_case_type text,
    previous_case_involvement boolean DEFAULT false NOT NULL,
    outcome text,
    next_hearing_date date,
    fir_number text,
    fir_date date,
    current_case_status text,
    court_attendance_details text,
    court_attendance_dates text,
    guardian_communication text,
    education_training text,
    center_facilities text,
    case_comments text,
    workflow_state text DEFAULT 'Draft'::text NOT NULL,
    workflow_notes text,
    sent_back_notes text,
    submitted_by_id integer,
    reviewed_by_df_id integer,
    reviewed_by_probation_id integer,
    approved_by_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.court_cases OWNER TO postgres;

--
-- Name: court_cases_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.court_cases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.court_cases_id_seq OWNER TO postgres;

--
-- Name: court_cases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.court_cases_id_seq OWNED BY public.court_cases.id;


--
-- Name: education_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.education_plans (
    id integer NOT NULL,
    plan_id text NOT NULL,
    child_id integer NOT NULL,
    program_type text NOT NULL,
    admission_eligible_for text,
    case_details text,
    recommender_case_worker_name text,
    record_title text,
    status text,
    institution_name text,
    start_date date NOT NULL,
    end_date date,
    education_level text,
    board_or_curriculum text,
    learning_goals text,
    trade_name text,
    certification_name text,
    weekly_hours integer,
    assessment_date date,
    assessor_name text,
    literacy_level text,
    numeracy_level text,
    digital_literacy_level text,
    interest_areas text,
    strengths text,
    support_needs text,
    progress_notes text,
    recommendations text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.education_plans OWNER TO postgres;

--
-- Name: education_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.education_plans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.education_plans_id_seq OWNER TO postgres;

--
-- Name: education_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.education_plans_id_seq OWNED BY public.education_plans.id;


--
-- Name: family_socioeconomic_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.family_socioeconomic_records (
    id integer NOT NULL,
    record_id text NOT NULL,
    child_id integer NOT NULL,
    parents_education text,
    parents_occupation text,
    parents_monthly_income integer,
    socioeconomic_status text,
    parents_contact_number text,
    child_relationship_with_parents text,
    siblings_count_and_order text,
    is_married boolean DEFAULT false NOT NULL,
    children_count integer,
    family_type text,
    parents_marital_status text,
    guardian_type text,
    is_orphan boolean DEFAULT false NOT NULL,
    family_member_substance_abuse boolean DEFAULT false NOT NULL,
    family_criminal_involvement boolean DEFAULT false NOT NULL,
    peer_circle_info text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.family_socioeconomic_records OWNER TO postgres;

--
-- Name: family_socioeconomic_records_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.family_socioeconomic_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.family_socioeconomic_records_id_seq OWNER TO postgres;

--
-- Name: family_socioeconomic_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.family_socioeconomic_records_id_seq OWNED BY public.family_socioeconomic_records.id;


--
-- Name: family_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.family_types (
    id integer NOT NULL,
    name_bn text NOT NULL,
    name_en text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.family_types OWNER TO postgres;

--
-- Name: family_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.family_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.family_types_id_seq OWNER TO postgres;

--
-- Name: family_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.family_types_id_seq OWNED BY public.family_types.id;


--
-- Name: follow_ups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.follow_ups (
    id integer NOT NULL,
    follow_up_id text NOT NULL,
    child_id integer NOT NULL,
    follow_up_date date NOT NULL,
    visit_type text NOT NULL,
    observation text,
    next_action text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.follow_ups OWNER TO postgres;

--
-- Name: follow_ups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.follow_ups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.follow_ups_id_seq OWNER TO postgres;

--
-- Name: follow_ups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.follow_ups_id_seq OWNED BY public.follow_ups.id;


--
-- Name: guardian_visits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.guardian_visits (
    id integer NOT NULL,
    visit_id text NOT NULL,
    child_id integer NOT NULL,
    guardian_id integer NOT NULL,
    visit_date date NOT NULL,
    purpose_of_visit text,
    observations text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.guardian_visits OWNER TO postgres;

--
-- Name: guardian_visits_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.guardian_visits_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.guardian_visits_id_seq OWNER TO postgres;

--
-- Name: guardian_visits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.guardian_visits_id_seq OWNED BY public.guardian_visits.id;


--
-- Name: guardians; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.guardians (
    id integer NOT NULL,
    child_id integer,
    guardian_id text NOT NULL,
    guardian_name text NOT NULL,
    relationship text NOT NULL,
    nid_no text,
    contact_number text,
    address text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.guardians OWNER TO postgres;

--
-- Name: guardians_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.guardians_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.guardians_id_seq OWNER TO postgres;

--
-- Name: guardians_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.guardians_id_seq OWNED BY public.guardians.id;


--
-- Name: health_assessments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.health_assessments (
    id integer NOT NULL,
    assessment_id text NOT NULL,
    child_id integer NOT NULL,
    assessment_date date NOT NULL,
    height real,
    weight real,
    bmi real,
    physical_condition text,
    mental_condition text,
    doctor_name text,
    visible_injury boolean DEFAULT false,
    injury_description text,
    chronic_disease text,
    congenital_disease_info text,
    has_hereditary_disease_history boolean DEFAULT false,
    hereditary_disease_details text,
    has_disability boolean DEFAULT false,
    disability text,
    substance_abuse boolean DEFAULT false,
    gbv_survivor boolean DEFAULT false,
    ongoing_medication text,
    immidiate_treatment_required boolean DEFAULT false,
    hospital_referral_needed boolean DEFAULT false,
    recommendation text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.health_assessments OWNER TO postgres;

--
-- Name: health_assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.health_assessments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.health_assessments_id_seq OWNER TO postgres;

--
-- Name: health_assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.health_assessments_id_seq OWNED BY public.health_assessments.id;


--
-- Name: measurement_surveys; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.measurement_surveys (
    id integer NOT NULL,
    survey_id text NOT NULL,
    center_id integer,
    child_id integer,
    enumerator_name text,
    survey_date date,
    age_group text,
    gender text,
    education_level text,
    detention_length text,
    home_district text,
    structured_routine text,
    education_hours text,
    vocational_hours text,
    physical_activity text,
    reading_access boolean,
    lifeskills_participation text,
    productive_activities boolean,
    complaint_opportunities boolean,
    family_contact text,
    safety_perception text,
    physical_punishment text,
    rules_fairness text,
    captain_system boolean,
    formal_education boolean,
    vocational_available boolean,
    trades_available jsonb,
    vocational_satisfaction text,
    self_harm boolean,
    inmate_conflicts text,
    emotional_wellbeing text,
    hopefulness text,
    legal_rights_informed boolean,
    legal_guidance text,
    main_challenges text,
    wished_changes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.measurement_surveys OWNER TO postgres;

--
-- Name: measurement_surveys_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.measurement_surveys_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.measurement_surveys_id_seq OWNER TO postgres;

--
-- Name: measurement_surveys_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.measurement_surveys_id_seq OWNED BY public.measurement_surveys.id;


--
-- Name: police_acquisitions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.police_acquisitions (
    id integer NOT NULL,
    acquisition_id text NOT NULL,
    child_id integer NOT NULL,
    hearing_date date NOT NULL,
    court_name text,
    case_number text,
    police_station text,
    officers_required integer DEFAULT 2 NOT NULL,
    escort_departure_time text,
    requisition_date date,
    status text DEFAULT 'Draft'::text NOT NULL,
    requested_by_id integer,
    center_id integer,
    police_officer_name text,
    acknowledgement_ref text,
    remarks text,
    reason_for_transfer text,
    receiving_authority text,
    transfer_date date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.police_acquisitions OWNER TO postgres;

--
-- Name: police_acquisitions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.police_acquisitions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.police_acquisitions_id_seq OWNER TO postgres;

--
-- Name: police_acquisitions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.police_acquisitions_id_seq OWNED BY public.police_acquisitions.id;


--
-- Name: release_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.release_records (
    id integer NOT NULL,
    release_id text NOT NULL,
    child_id integer NOT NULL,
    release_date date NOT NULL,
    release_type text NOT NULL,
    handed_over_to text,
    authority_approval text DEFAULT 'Pending'::text,
    remarks text,
    approval_status text DEFAULT 'Draft'::text NOT NULL,
    submitted_by text,
    approved_by_name text,
    rejection_note text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    cw_feedback text,
    po_feedback text,
    rejected_by_name text
);


ALTER TABLE public.release_records OWNER TO postgres;

--
-- Name: release_records_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.release_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.release_records_id_seq OWNER TO postgres;

--
-- Name: release_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.release_records_id_seq OWNED BY public.release_records.id;


--
-- Name: risk_assessments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.risk_assessments (
    id integer NOT NULL,
    risk_id text NOT NULL,
    child_id integer NOT NULL,
    assessment_date date NOT NULL,
    assessed_by text,
    previous_occupation text,
    child_nature text,
    communication_skill text,
    communication_with_guardian text,
    education_training_info text,
    child_counseling_status text,
    family_counseling_status text,
    recreation_arrangement text,
    other_rehabilitation_info text,
    abuse_risk text,
    trafficking_risk text,
    reoffending_risk text,
    self_harm_risk text,
    overall_risk_level text NOT NULL,
    immediate_action_required boolean DEFAULT false,
    protection_measures text,
    status text DEFAULT 'Draft'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.risk_assessments OWNER TO postgres;

--
-- Name: risk_assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.risk_assessments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.risk_assessments_id_seq OWNER TO postgres;

--
-- Name: risk_assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.risk_assessments_id_seq OWNED BY public.risk_assessments.id;


--
-- Name: role_center_access; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_center_access (
    id integer NOT NULL,
    role_id integer NOT NULL,
    center_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.role_center_access OWNER TO postgres;

--
-- Name: role_center_access_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.role_center_access_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.role_center_access_id_seq OWNER TO postgres;

--
-- Name: role_center_access_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.role_center_access_id_seq OWNED BY public.role_center_access.id;


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    id integer NOT NULL,
    role_id integer NOT NULL,
    module text NOT NULL,
    can_view boolean DEFAULT false NOT NULL,
    can_create boolean DEFAULT false NOT NULL,
    can_edit boolean DEFAULT false NOT NULL,
    can_delete boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- Name: role_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.role_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.role_permissions_id_seq OWNER TO postgres;

--
-- Name: role_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.role_permissions_id_seq OWNED BY public.role_permissions.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    role_name text NOT NULL,
    scope text,
    access_type text,
    description text,
    center_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: trainings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trainings (
    id integer NOT NULL,
    name_bn text NOT NULL,
    name_en text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.trainings OWNER TO postgres;

--
-- Name: trainings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trainings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trainings_id_seq OWNER TO postgres;

--
-- Name: trainings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trainings_id_seq OWNED BY public.trainings.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    full_name text NOT NULL,
    email text,
    password_hash text NOT NULL,
    role_id integer,
    center_id integer,
    administrative_unit_id integer,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    workflow_role text
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: workflow_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workflow_logs (
    id integer NOT NULL,
    record_type text NOT NULL,
    record_id integer NOT NULL,
    user_id integer NOT NULL,
    action text NOT NULL,
    message text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.workflow_logs OWNER TO postgres;

--
-- Name: workflow_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.workflow_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.workflow_logs_id_seq OWNER TO postgres;

--
-- Name: workflow_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.workflow_logs_id_seq OWNED BY public.workflow_logs.id;


--
-- Name: administrative_units id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrative_units ALTER COLUMN id SET DEFAULT nextval('public.administrative_units_id_seq'::regclass);


--
-- Name: admissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admissions ALTER COLUMN id SET DEFAULT nextval('public.admissions_id_seq'::regclass);


--
-- Name: case_agreements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_agreements ALTER COLUMN id SET DEFAULT nextval('public.case_agreements_id_seq'::regclass);


--
-- Name: case_detail_assessments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_detail_assessments ALTER COLUMN id SET DEFAULT nextval('public.case_detail_assessments_id_seq'::regclass);


--
-- Name: case_intervention_plans id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_intervention_plans ALTER COLUMN id SET DEFAULT nextval('public.case_intervention_plans_id_seq'::regclass);


--
-- Name: case_risk_assessments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_risk_assessments ALTER COLUMN id SET DEFAULT nextval('public.case_risk_assessments_id_seq'::regclass);


--
-- Name: case_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_types ALTER COLUMN id SET DEFAULT nextval('public.case_types_id_seq'::regclass);


--
-- Name: cases id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cases ALTER COLUMN id SET DEFAULT nextval('public.cases_id_seq'::regclass);


--
-- Name: centers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.centers ALTER COLUMN id SET DEFAULT nextval('public.centers_id_seq'::regclass);


--
-- Name: children id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.children ALTER COLUMN id SET DEFAULT nextval('public.children_id_seq'::regclass);


--
-- Name: classes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classes ALTER COLUMN id SET DEFAULT nextval('public.classes_id_seq'::regclass);


--
-- Name: counseling_sessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.counseling_sessions ALTER COLUMN id SET DEFAULT nextval('public.counseling_sessions_id_seq'::regclass);


--
-- Name: court_cases id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.court_cases ALTER COLUMN id SET DEFAULT nextval('public.court_cases_id_seq'::regclass);


--
-- Name: education_plans id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.education_plans ALTER COLUMN id SET DEFAULT nextval('public.education_plans_id_seq'::regclass);


--
-- Name: family_socioeconomic_records id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.family_socioeconomic_records ALTER COLUMN id SET DEFAULT nextval('public.family_socioeconomic_records_id_seq'::regclass);


--
-- Name: family_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.family_types ALTER COLUMN id SET DEFAULT nextval('public.family_types_id_seq'::regclass);


--
-- Name: follow_ups id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follow_ups ALTER COLUMN id SET DEFAULT nextval('public.follow_ups_id_seq'::regclass);


--
-- Name: guardian_visits id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guardian_visits ALTER COLUMN id SET DEFAULT nextval('public.guardian_visits_id_seq'::regclass);


--
-- Name: guardians id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guardians ALTER COLUMN id SET DEFAULT nextval('public.guardians_id_seq'::regclass);


--
-- Name: health_assessments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.health_assessments ALTER COLUMN id SET DEFAULT nextval('public.health_assessments_id_seq'::regclass);


--
-- Name: measurement_surveys id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.measurement_surveys ALTER COLUMN id SET DEFAULT nextval('public.measurement_surveys_id_seq'::regclass);


--
-- Name: police_acquisitions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.police_acquisitions ALTER COLUMN id SET DEFAULT nextval('public.police_acquisitions_id_seq'::regclass);


--
-- Name: release_records id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.release_records ALTER COLUMN id SET DEFAULT nextval('public.release_records_id_seq'::regclass);


--
-- Name: risk_assessments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.risk_assessments ALTER COLUMN id SET DEFAULT nextval('public.risk_assessments_id_seq'::regclass);


--
-- Name: role_center_access id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_center_access ALTER COLUMN id SET DEFAULT nextval('public.role_center_access_id_seq'::regclass);


--
-- Name: role_permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions ALTER COLUMN id SET DEFAULT nextval('public.role_permissions_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: trainings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trainings ALTER COLUMN id SET DEFAULT nextval('public.trainings_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: workflow_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_logs ALTER COLUMN id SET DEFAULT nextval('public.workflow_logs_id_seq'::regclass);


--
-- Data for Name: administrative_units; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.administrative_units (id, unit_name, unit_name_bn, unit_name_en, unit_type, parent_unit_id, linked_center_id, created_at, updated_at) FROM stdin;
1	DSS Head Office	\N	\N	HQ	\N	\N	2026-05-07 16:22:14.781044+06	2026-05-07 16:22:14.781044+06
2	Dhaka Division	\N	\N	Division	1	\N	2026-05-07 16:22:14.785025+06	2026-05-07 16:22:14.785025+06
3	Khulna Division	\N	\N	Division	1	\N	2026-05-07 16:22:14.78964+06	2026-05-07 16:22:14.78964+06
4	Gazipur District	\N	\N	District	2	\N	2026-05-07 16:22:14.793426+06	2026-05-07 16:22:14.793426+06
5	Jashore District	\N	\N	District	3	\N	2026-05-07 16:22:14.798056+06	2026-05-07 16:22:14.798056+06
6	CDC Boys Tongi Unit	\N	\N	Center	4	2	2026-05-07 16:22:14.803138+06	2026-05-07 16:22:14.803138+06
7	CDC Girls Konabari Unit	\N	\N	Center	4	3	2026-05-07 16:22:14.809771+06	2026-05-07 16:22:14.809771+06
8	CDC Boys Jashore Unit	\N	\N	Center	5	4	2026-05-07 16:22:14.815368+06	2026-05-07 16:22:14.815368+06
\.


--
-- Data for Name: admissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admissions (id, admission_id, child_id, center_id, admission_date, admission_time, admission_source, receiving_officer, documents_verified, verified_by, verification_date, approval_status, authority_remarks, cw_feedback, po_feedback, rejection_note, approved_by_name, rejected_by_name, created_at, updated_at) FROM stdin;
1	ADM-2026-00001	1	2	2024-04-02	\N	আদালতের নির্দেশে	সজল কুমার দাস	t	\N	\N	Pending	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:32.664686+06	2026-05-07 16:22:32.664686+06
2	ADM-2026-00002	2	2	2024-08-10	\N	পুলিশ হেফাজত থেকে	সজল কুমার দাস	t	\N	\N	Pending	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:32.770533+06	2026-05-07 16:22:32.770533+06
3	ADM-2026-00003	3	2	2024-01-23	\N	আদালতের নির্দেশে	সজল কুমার দাস	t	\N	\N	Pending	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:32.84825+06	2026-05-07 16:22:32.84825+06
4	ADM-2026-00004	4	2	2024-04-02	\N	সমাজসেবা অধিদফতর	সজল কুমার দাস	t	\N	\N	Approved	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:32.911823+06	2026-05-07 16:22:32.911823+06
5	ADM-2026-00005	5	2	2024-06-21	\N	আদালতের নির্দেশে	সজল কুমার দাস	t	\N	\N	Pending	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:32.994424+06	2026-05-07 16:22:32.994424+06
6	ADM-2026-00006	6	2	2024-11-18	\N	পুলিশ হেফাজত থেকে	সজল কুমার দাস	t	\N	\N	Pending	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.079286+06	2026-05-07 16:22:33.079286+06
7	ADM-2026-00007	7	2	2023-07-07	\N	আদালতের নির্দেশে	সজল কুমার দাস	t	\N	\N	Approved	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.170334+06	2026-05-07 16:22:33.170334+06
8	ADM-2026-00008	8	2	2023-03-29	\N	সমাজসেবা অধিদফতর	সজল কুমার দাস	t	\N	\N	Pending	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.362762+06	2026-05-07 16:22:33.362762+06
9	ADM-2026-00009	9	2	2023-04-03	\N	আদালতের নির্দেশে	সজল কুমার দাস	t	\N	\N	Pending	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.406721+06	2026-05-07 16:22:33.406721+06
10	ADM-2026-00010	10	2	2024-11-18	\N	আদালতের নির্দেশে	সজল কুমার দাস	t	\N	\N	Approved	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.45178+06	2026-05-07 16:22:33.45178+06
11	ADM-2026-00026	11	3	2024-04-02	\N	আদালতের নির্দেশে	মিসেস শিরিন আক্তার	t	\N	\N	Pending	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.535202+06	2026-05-07 16:22:33.535202+06
12	ADM-2026-00027	12	3	2024-08-10	\N	সমাজসেবা অধিদফতর	মিসেস শিরিন আক্তার	t	\N	\N	Pending	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.579707+06	2026-05-07 16:22:33.579707+06
13	ADM-2026-00028	13	3	2024-04-02	\N	পুলিশ হেফাজত থেকে	মিসেস শিরিন আক্তার	t	\N	\N	Pending	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.630092+06	2026-05-07 16:22:33.630092+06
14	ADM-2026-00029	14	3	2024-01-23	\N	আদালতের নির্দেশে	মিসেস শিরিন আক্তার	t	\N	\N	Approved	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.70321+06	2026-05-07 16:22:33.70321+06
15	ADM-2026-00030	15	3	2024-03-13	\N	সমাজসেবা অধিদফতর	মিসেস শিরিন আক্তার	t	\N	\N	Pending	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.775518+06	2026-05-07 16:22:33.775518+06
16	ADM-2026-00031	16	3	2023-03-29	\N	পুলিশ হেফাজত থেকে	মিসেস শিরিন আক্তার	t	\N	\N	Pending	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.851513+06	2026-05-07 16:22:33.851513+06
17	ADM-2026-00032	17	3	2023-04-03	\N	আদালতের নির্দেশে	মিসেস শিরিন আক্তার	t	\N	\N	Pending	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.951081+06	2026-05-07 16:22:33.951081+06
18	ADM-2026-00033	18	3	2024-08-10	\N	সমাজসেবা অধিদফতর	মিসেস শিরিন আক্তার	t	\N	\N	Approved	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.035409+06	2026-05-07 16:22:34.035409+06
19	ADM-2026-00049	19	4	2024-04-02	\N	আদালতের নির্দেশে	মোহাম্মদ বশির আহমেদ	t	\N	\N	Pending	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.167155+06	2026-05-07 16:22:34.167155+06
20	ADM-2026-00050	20	4	2024-06-21	\N	পুলিশ হেফাজত থেকে	মোহাম্মদ বশির আহমেদ	t	\N	\N	Pending	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.244817+06	2026-05-07 16:22:34.244817+06
21	ADM-2026-00051	21	4	2024-01-23	\N	সমাজসেবা অধিদফতর	মোহাম্মদ বশির আহমেদ	t	\N	\N	Approved	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.319195+06	2026-05-07 16:22:34.319195+06
22	ADM-2026-00052	22	4	2024-03-13	\N	আদালতের নির্দেশে	মোহাম্মদ বশির আহমেদ	t	\N	\N	Pending	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.404358+06	2026-05-07 16:22:34.404358+06
23	ADM-2026-00053	23	4	2023-04-03	\N	আদালতের নির্দেশে	মোহাম্মদ বশির আহমেদ	t	\N	\N	Pending	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.488307+06	2026-05-07 16:22:34.488307+06
24	ADM-2026-00054	24	4	2022-04-03	\N	আদালতের নির্দেশে	মোহাম্মদ বশির আহমেদ	t	\N	\N	Approved	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.567533+06	2026-05-07 16:22:34.567533+06
25	ADM-2026-00055	25	4	2024-08-10	\N	সমাজসেবা অধিদফতর	মোহাম্মদ বশির আহমেদ	t	\N	\N	Approved	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.648503+06	2026-05-07 16:22:34.648503+06
26	ADM-2026-03700	26	3	2026-05-07		court order		f	\N	\N	Submitted to CW	\N	\N	\N	\N	\N	\N	2026-05-07 16:40:24.182017+06	2026-05-07 16:40:27.22+06
\.


--
-- Data for Name: case_agreements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.case_agreements (id, case_id, registration_no, child_name_at_agreement, father_name_at_agreement, mother_name_at_agreement, age_at_agreement, gender_at_agreement, religion_at_agreement, current_address_at_agreement, permanent_address_at_agreement, guardian_info, witness_names, agreement_date, social_worker_signature, officer_signature, guardian_signature, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: case_detail_assessments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.case_detail_assessments (id, case_id, court_order_details, assessment_reason, family_members, current_living_situation, previous_services, child_domain_scores, parent_capacity_scores, environment_scores, conclusion_reason, overall_comments, changes_needed, child_opinion, parent_opinion, assessed_by, assessor_designation, assessed_at, parent_signature, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: case_intervention_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.case_intervention_plans (id, case_id, change_needed, activities, how_to_know_improvement, child_opinion, parent_opinion, plan_date, next_review_date, parent_signature, social_worker_signature, attendees_names, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: case_risk_assessments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.case_risk_assessments (id, case_id, domain_scores, total_score, assessed_by, assessor_designation, assessed_at, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: case_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.case_types (id, name_bn, name_en, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cases (id, case_id, child_id, case_opening_date, assigned_case_worker, risk_level, case_status, case_type, case_summary, investigation_notes, recommendation, center_id, is_special_case, is_priority_case, workflow_state, workflow_notes, sent_back_notes, submitted_by_id, reviewed_by_df_id, reviewed_by_caseworker_id, reviewed_by_probation_id, approved_by_id, registration_number, name_english, mother_name, father_name, guardian_name, guardian_relationship, birth_reg_no, disability_id, nationality, ethnicity, birthplace, religion, occupation, income, current_address_division, current_address_district, current_address_upazila, current_address_union, current_address_village, permanent_address_division, permanent_address_district, permanent_address_upazila, permanent_address_union, permanent_address_village, guardian_phone, email, living_with, child_problems, other_problems, referral_reason, referral_contact_name, referral_contact_address, referral_contact_phone, referral_relationship, urgent_service_needed, urgent_service_types, referral_destination, receiver_name, receiver_id_no, intake_date, intake_officer_name, intake_officer_designation, assessor_name, supervisor_name, created_at, updated_at) FROM stdin;
1	CASE-2026-00001	1	2024-04-02	সজল কুমার দাস	Medium	Open	\N	শিশুটি আদালতের নির্দেশে থেকে কেন্দ্রে ভর্তি হয়েছে। প্রাথমিক মূল্যায়নে মাঝারি ঝুঁকি চিহ্নিত।	পারিবারিক পরিস্থিতি পর্যবেক্ষণে রাখা হয়েছে।	নিয়মিত ফলো-আপ প্রয়োজন।	2	f	f	Reviewed by PO	\N	\N	\N	\N	\N	\N	\N	\N	\N	নাজমা বেগম	মোহাম্মদ করিম হাসান	\N	\N	\N	\N	Bangladeshi	\N	\N	Islam	\N	\N	ঢাকা	গাজীপুর	টঙ্গি	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:32.63937+06	2026-05-07 16:22:32.63937+06
2	CASE-2026-00002	2	2024-08-10	সজল কুমার দাস	High	Open	\N	শিশুটি পুলিশ হেফাজত থেকে থেকে কেন্দ্রে ভর্তি হয়েছে। প্রাথমিক মূল্যায়নে উচ্চ ঝুঁকি চিহ্নিত।	পারিবারিক পরিস্থিতি পর্যবেক্ষণে রাখা হয়েছে।	নিয়মিত ফলো-আপ প্রয়োজন।	2	f	f	Reviewed by DF	\N	\N	\N	\N	\N	\N	\N	\N	\N	রহিমা বেগম	আবদুল করিম	\N	\N	\N	\N	Bangladeshi	\N	\N	Islam	\N	\N	ঢাকা	নারায়ণগঞ্জ	রূপগঞ্জ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:32.751779+06	2026-05-07 16:22:32.751779+06
3	CASE-2026-00003	3	2024-01-23	সজল কুমার দাস	High	Open	\N	শিশুটি আদালতের নির্দেশে থেকে কেন্দ্রে ভর্তি হয়েছে। প্রাথমিক মূল্যায়নে উচ্চ ঝুঁকি চিহ্নিত।	পারিবারিক পরিস্থিতি পর্যবেক্ষণে রাখা হয়েছে।	নিয়মিত ফলো-আপ প্রয়োজন।	2	f	f	Submitted to DF	\N	\N	\N	\N	\N	\N	\N	\N	\N	হাসিনা বেগম	রফিকুল রহমান	\N	\N	\N	\N	Bangladeshi	\N	\N	Islam	\N	\N	ঢাকা	গাজীপুর	কালীগঞ্জ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:32.837212+06	2026-05-07 16:22:32.837212+06
4	CASE-2026-00004	4	2024-04-02	সজল কুমার দাস	Low	Open	\N	শিশুটি সমাজসেবা অধিদফতর থেকে কেন্দ্রে ভর্তি হয়েছে। প্রাথমিক মূল্যায়নে কম ঝুঁকি চিহ্নিত।	পারিবারিক পরিস্থিতি পর্যবেক্ষণে রাখা হয়েছে।	পরিবারে পুনর্মিলন বিবেচনা করুন।	2	f	f	Approved	\N	\N	\N	\N	\N	\N	\N	\N	\N	সুফিয়া আহমেদ	মোহাম্মদ ইকবাল আহমেদ	\N	\N	\N	\N	Bangladeshi	\N	\N	Islam	\N	\N	ঢাকা	ঢাকা	দেমড়া	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:32.897492+06	2026-05-07 16:22:32.897492+06
5	CASE-2026-00005	5	2024-06-21	সজল কুমার দাস	Medium	Open	\N	শিশুটি আদালতের নির্দেশে থেকে কেন্দ্রে ভর্তি হয়েছে। প্রাথমিক মূল্যায়নে মাঝারি ঝুঁকি চিহ্নিত।	পারিবারিক পরিস্থিতি পর্যবেক্ষণে রাখা হয়েছে।	নিয়মিত ফলো-আপ প্রয়োজন।	2	f	f	Draft	\N	\N	\N	\N	\N	\N	\N	\N	\N	মরিয়ম হোসেন	আলী হোসেন	\N	\N	\N	\N	Bangladeshi	\N	\N	Islam	\N	\N	ঢাকা	গাজীপুর	শ্রীপুর	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:32.97842+06	2026-05-07 16:22:32.97842+06
6	CASE-2026-00006	6	2024-11-18	সজল কুমার দাস	Medium	Open	\N	শিশুটি পুলিশ হেফাজত থেকে থেকে কেন্দ্রে ভর্তি হয়েছে। প্রাথমিক মূল্যায়নে মাঝারি ঝুঁকি চিহ্নিত।	পারিবারিক পরিস্থিতি পর্যবেক্ষণে রাখা হয়েছে।	নিয়মিত ফলো-আপ প্রয়োজন।	2	f	f	Submitted to DF	\N	\N	\N	\N	\N	\N	\N	\N	\N	পারভিন বেগম	মাহমুদুল খান	\N	\N	\N	\N	Bangladeshi	\N	\N	Islam	\N	\N	ঢাকা	কিশোরগঞ্জ	ভৈরব	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.061006+06	2026-05-07 16:22:33.061006+06
7	CASE-2026-00007	7	2023-07-07	সজল কুমার দাস	Medium	Open	\N	শিশুটি আদালতের নির্দেশে থেকে কেন্দ্রে ভর্তি হয়েছে। প্রাথমিক মূল্যায়নে মাঝারি ঝুঁকি চিহ্নিত।	পারিবারিক পরিস্থিতি পর্যবেক্ষণে রাখা হয়েছে।	পরিবারে পুনর্মিলন বিবেচনা করুন।	2	f	f	Approved	\N	\N	\N	\N	\N	\N	\N	\N	\N	আমেনা বেগম	নুরুজ্জামান	\N	\N	\N	\N	Bangladeshi	\N	\N	Islam	\N	\N	ঢাকা	গাজীপুর	টঙ্গি	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.152993+06	2026-05-07 16:22:33.152993+06
8	CASE-2026-00008	8	2023-03-29	সজল কুমার দাস	High	Open	\N	শিশুটি সমাজসেবা অধিদফতর থেকে কেন্দ্রে ভর্তি হয়েছে। প্রাথমিক মূল্যায়নে উচ্চ ঝুঁকি চিহ্নিত।	পারিবারিক পরিস্থিতি পর্যবেক্ষণে রাখা হয়েছে।	নিয়মিত ফলো-আপ প্রয়োজন।	2	f	f	Reviewed by PO	\N	\N	\N	\N	\N	\N	\N	\N	\N	রুকাইয়া খাতুন	শামসুল আলম	\N	\N	\N	\N	Bangladeshi	\N	\N	Islam	\N	\N	ঢাকা	মানিকগঞ্জ	সিংগাইর	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.306475+06	2026-05-07 16:22:33.306475+06
9	CASE-2026-00009	9	2023-04-03	সজল কুমার দাস	High	Open	\N	শিশুটি আদালতের নির্দেশে থেকে কেন্দ্রে ভর্তি হয়েছে। প্রাথমিক মূল্যায়নে উচ্চ ঝুঁকি চিহ্নিত।	পারিবারিক পরিস্থিতি পর্যবেক্ষণে রাখা হয়েছে।	নিয়মিত ফলো-আপ প্রয়োজন।	2	f	f	Reviewed by PO	\N	\N	\N	\N	\N	\N	\N	\N	\N	জরিনা বেগম	হারুনুর রশিদ	\N	\N	\N	\N	Bangladeshi	\N	\N	Islam	\N	\N	ঢাকা	গাজীপুর	টঙ্গি	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.397407+06	2026-05-07 16:22:33.397407+06
10	CASE-2026-00010	10	2024-11-18	সজল কুমার দাস	Low	Closed	\N	শিশুটি আদালতের নির্দেশে থেকে কেন্দ্রে ভর্তি হয়েছে। প্রাথমিক মূল্যায়নে কম ঝুঁকি চিহ্নিত।	পারিবারিক পরিস্থিতি পর্যবেক্ষণে রাখা হয়েছে।	পরিবারে পুনর্মিলন বিবেচনা করুন।	2	f	f	Approved	\N	\N	\N	\N	\N	\N	\N	\N	\N	নার্গিস বেগম	মোস্তফা হাসান	\N	\N	\N	\N	Bangladeshi	\N	\N	Islam	\N	\N	ঢাকা	ঢাকা	গুলশান	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.442817+06	2026-05-07 16:22:33.442817+06
11	CASE-2026-00026	11	2024-04-02	মিসেস শিরিন আক্তার	High	Open	\N	শিশুটি আদালতের নির্দেশে থেকে কেন্দ্রে ভর্তি হয়েছে। প্রাথমিক মূল্যায়নে উচ্চ ঝুঁকি চিহ্নিত।	পারিবারিক পরিস্থিতি পর্যবেক্ষণে রাখা হয়েছে।	নিয়মিত ফলো-আপ প্রয়োজন।	3	f	f	Submitted to DF	\N	\N	\N	\N	\N	\N	\N	\N	\N	মোসাম্মৎ নার্গিস	আলমগীর হোসেন	\N	\N	\N	\N	Bangladeshi	\N	\N	Islam	\N	\N	ঢাকা	গাজীপুর	কোনাবাড়ি	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.52625+06	2026-05-07 16:22:33.52625+06
12	CASE-2026-00027	12	2024-08-10	মিসেস শিরিন আক্তার	Medium	Open	\N	শিশুটি সমাজসেবা অধিদফতর থেকে কেন্দ্রে ভর্তি হয়েছে। প্রাথমিক মূল্যায়নে মাঝারি ঝুঁকি চিহ্নিত।	পারিবারিক পরিস্থিতি পর্যবেক্ষণে রাখা হয়েছে।	নিয়মিত ফলো-আপ প্রয়োজন।	3	f	f	Draft	\N	\N	\N	\N	\N	\N	\N	\N	\N	বেগম রোকেয়া	জাহাঙ্গীর আলম	\N	\N	\N	\N	Bangladeshi	\N	\N	Islam	\N	\N	ময়মনসিংহ	ময়মনসিংহ	ত্রিশাল	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.571018+06	2026-05-07 16:22:33.571018+06
13	CASE-2026-00028	13	2024-04-02	মিসেস শিরিন আক্তার	High	Open	\N	শিশুটি পুলিশ হেফাজত থেকে থেকে কেন্দ্রে ভর্তি হয়েছে। প্রাথমিক মূল্যায়নে উচ্চ ঝুঁকি চিহ্নিত।	পারিবারিক পরিস্থিতি পর্যবেক্ষণে রাখা হয়েছে।	নিয়মিত ফলো-আপ প্রয়োজন।	3	f	f	Reviewed by DF	\N	\N	\N	\N	\N	\N	\N	\N	\N	হাসনা হেনা	আব্দুল লতিফ	\N	\N	\N	\N	Bangladeshi	\N	\N	Islam	\N	\N	ময়মনসিংহ	শেরপুর	নালিতাবাড়ী	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.618725+06	2026-05-07 16:22:33.618725+06
14	CASE-2026-00029	14	2024-01-23	মিসেস শিরিন আক্তার	Low	Open	\N	শিশুটি আদালতের নির্দেশে থেকে কেন্দ্রে ভর্তি হয়েছে। প্রাথমিক মূল্যায়নে কম ঝুঁকি চিহ্নিত।	পারিবারিক পরিস্থিতি পর্যবেক্ষণে রাখা হয়েছে।	পরিবারে পুনর্মিলন বিবেচনা করুন।	3	f	f	Approved	\N	\N	\N	\N	\N	\N	\N	\N	\N	রোকসানা বেগম	মতিউর রহমান	\N	\N	\N	\N	Bangladeshi	\N	\N	Islam	\N	\N	ময়মনসিংহ	নেত্রকোণা	কেন্দুয়া	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.688805+06	2026-05-07 16:22:33.688805+06
15	CASE-2026-00030	15	2024-03-13	মিসেস শিরিন আক্তার	Medium	Open	\N	শিশুটি সমাজসেবা অধিদফতর থেকে কেন্দ্রে ভর্তি হয়েছে। প্রাথমিক মূল্যায়নে মাঝারি ঝুঁকি চিহ্নিত।	পারিবারিক পরিস্থিতি পর্যবেক্ষণে রাখা হয়েছে।	নিয়মিত ফলো-আপ প্রয়োজন।	3	f	f	Reviewed by PO	\N	\N	\N	\N	\N	\N	\N	\N	\N	জাহানারা বেগম	আবুল কাসেম	\N	\N	\N	\N	Bangladeshi	\N	\N	Islam	\N	\N	ঢাকা	গাজীপুর	কালিয়াকৈর	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.759978+06	2026-05-07 16:22:33.759978+06
16	CASE-2026-00031	16	2023-03-29	মিসেস শিরিন আক্তার	High	Open	\N	শিশুটি পুলিশ হেফাজত থেকে থেকে কেন্দ্রে ভর্তি হয়েছে। প্রাথমিক মূল্যায়নে উচ্চ ঝুঁকি চিহ্নিত।	পারিবারিক পরিস্থিতি পর্যবেক্ষণে রাখা হয়েছে।	নিয়মিত ফলো-আপ প্রয়োজন।	3	f	f	Reviewed by DF	\N	\N	\N	\N	\N	\N	\N	\N	\N	আক্লিমা বেগম	সিরাজুল ইসলাম	\N	\N	\N	\N	Bangladeshi	\N	\N	Islam	\N	\N	রংপুর	কুড়িগ্রাম	ভুরুঙ্গামারী	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.834131+06	2026-05-07 16:22:33.834131+06
17	CASE-2026-00032	17	2023-04-03	মিসেস শিরিন আক্তার	High	Open	\N	শিশুটি আদালতের নির্দেশে থেকে কেন্দ্রে ভর্তি হয়েছে। প্রাথমিক মূল্যায়নে উচ্চ ঝুঁকি চিহ্নিত।	পারিবারিক পরিস্থিতি পর্যবেক্ষণে রাখা হয়েছে।	নিয়মিত ফলো-আপ প্রয়োজন।	3	f	f	Reviewed by PO	\N	\N	\N	\N	\N	\N	\N	\N	\N	হনুফা বেগম	মোখলেসুর রহমান	\N	\N	\N	\N	Bangladeshi	\N	\N	Islam	\N	\N	ময়মনসিংহ	জামালপুর	মেলান্দহ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.93319+06	2026-05-07 16:22:33.93319+06
18	CASE-2026-00033	18	2024-08-10	মিসেস শিরিন আক্তার	Low	Open	\N	শিশুটি সমাজসেবা অধিদফতর থেকে কেন্দ্রে ভর্তি হয়েছে। প্রাথমিক মূল্যায়নে কম ঝুঁকি চিহ্নিত।	পারিবারিক পরিস্থিতি পর্যবেক্ষণে রাখা হয়েছে।	পরিবারে পুনর্মিলন বিবেচনা করুন।	3	f	f	Approved	\N	\N	\N	\N	\N	\N	\N	\N	\N	সুলতানা রাজিয়া	আব্বাস আলী	\N	\N	\N	\N	Bangladeshi	\N	\N	Islam	\N	\N	ঢাকা	গাজীপুর	কোনাবাড়ি	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.017155+06	2026-05-07 16:22:34.017155+06
19	CASE-2026-00049	19	2024-04-02	মোহাম্মদ বশির আহমেদ	Medium	Open	\N	শিশুটি আদালতের নির্দেশে থেকে কেন্দ্রে ভর্তি হয়েছে। প্রাথমিক মূল্যায়নে মাঝারি ঝুঁকি চিহ্নিত।	পারিবারিক পরিস্থিতি পর্যবেক্ষণে রাখা হয়েছে।	নিয়মিত ফলো-আপ প্রয়োজন।	4	f	f	Submitted to DF	\N	\N	\N	\N	\N	\N	\N	\N	\N	রোজিনা বেগম	আবুল হাসেম	\N	\N	\N	\N	Bangladeshi	\N	\N	Islam	\N	\N	খুলনা	যশোর	ফুলেরহাট	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.151169+06	2026-05-07 16:22:34.151169+06
20	CASE-2026-00050	20	2024-06-21	মোহাম্মদ বশির আহমেদ	High	Open	\N	শিশুটি পুলিশ হেফাজত থেকে থেকে কেন্দ্রে ভর্তি হয়েছে। প্রাথমিক মূল্যায়নে উচ্চ ঝুঁকি চিহ্নিত।	পারিবারিক পরিস্থিতি পর্যবেক্ষণে রাখা হয়েছে।	নিয়মিত ফলো-আপ প্রয়োজন।	4	f	f	Reviewed by DF	\N	\N	\N	\N	\N	\N	\N	\N	\N	সেলিনা বেগম	সাজেদুল ইসলাম	\N	\N	\N	\N	Bangladeshi	\N	\N	Islam	\N	\N	খুলনা	সাতক্ষীরা	শ্যামনগর	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.230564+06	2026-05-07 16:22:34.230564+06
21	CASE-2026-00051	21	2024-01-23	মোহাম্মদ বশির আহমেদ	Low	Open	\N	শিশুটি সমাজসেবা অধিদফতর থেকে কেন্দ্রে ভর্তি হয়েছে। প্রাথমিক মূল্যায়নে কম ঝুঁকি চিহ্নিত।	পারিবারিক পরিস্থিতি পর্যবেক্ষণে রাখা হয়েছে।	পরিবারে পুনর্মিলন বিবেচনা করুন।	4	f	f	Approved	\N	\N	\N	\N	\N	\N	\N	\N	\N	মাহফুজা বেগম	মোহাম্মদ ইউসুফ	\N	\N	\N	\N	Bangladeshi	\N	\N	Islam	\N	\N	খুলনা	খুলনা	ডুমুরিয়া	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.304627+06	2026-05-07 16:22:34.304627+06
22	CASE-2026-00052	22	2024-03-13	মোহাম্মদ বশির আহমেদ	Medium	Open	\N	শিশুটি আদালতের নির্দেশে থেকে কেন্দ্রে ভর্তি হয়েছে। প্রাথমিক মূল্যায়নে মাঝারি ঝুঁকি চিহ্নিত।	পারিবারিক পরিস্থিতি পর্যবেক্ষণে রাখা হয়েছে।	নিয়মিত ফলো-আপ প্রয়োজন।	4	f	f	Draft	\N	\N	\N	\N	\N	\N	\N	\N	\N	কহিনুর বেগম	মজনু মিয়া	\N	\N	\N	\N	Bangladeshi	\N	\N	Islam	\N	\N	খুলনা	নড়াইল	লোহাগড়া	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.384877+06	2026-05-07 16:22:34.384877+06
23	CASE-2026-00053	23	2023-04-03	মোহাম্মদ বশির আহমেদ	High	Open	\N	শিশুটি আদালতের নির্দেশে থেকে কেন্দ্রে ভর্তি হয়েছে। প্রাথমিক মূল্যায়নে উচ্চ ঝুঁকি চিহ্নিত।	পারিবারিক পরিস্থিতি পর্যবেক্ষণে রাখা হয়েছে।	নিয়মিত ফলো-আপ প্রয়োজন।	4	f	f	Reviewed by PO	\N	\N	\N	\N	\N	\N	\N	\N	\N	তাহমিনা বেগম	বাবুল ইসলাম	\N	\N	\N	\N	Bangladeshi	\N	\N	Islam	\N	\N	খুলনা	যশোর	কেশবপুর	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.470995+06	2026-05-07 16:22:34.470995+06
24	CASE-2026-00054	24	2022-04-03	মোহাম্মদ বশির আহমেদ	High	Open	\N	শিশুটি আদালতের নির্দেশে থেকে কেন্দ্রে ভর্তি হয়েছে। প্রাথমিক মূল্যায়নে উচ্চ ঝুঁকি চিহ্নিত।	পারিবারিক পরিস্থিতি পর্যবেক্ষণে রাখা হয়েছে।	পরিবারে পুনর্মিলন বিবেচনা করুন।	4	f	f	Approved	\N	\N	\N	\N	\N	\N	\N	\N	\N	মেহেরুন নেসা	কামাল হোসেন	\N	\N	\N	\N	Bangladeshi	\N	\N	Islam	\N	\N	খুলনা	যশোর	বাঘারপাড়া	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.551925+06	2026-05-07 16:22:34.551925+06
25	CASE-2026-00055	25	2024-08-10	মোহাম্মদ বশির আহমেদ	Low	Closed	\N	শিশুটি সমাজসেবা অধিদফতর থেকে কেন্দ্রে ভর্তি হয়েছে। প্রাথমিক মূল্যায়নে কম ঝুঁকি চিহ্নিত।	পারিবারিক পরিস্থিতি পর্যবেক্ষণে রাখা হয়েছে।	পরিবারে পুনর্মিলন বিবেচনা করুন।	4	f	f	Approved	\N	\N	\N	\N	\N	\N	\N	\N	\N	মমতাজ বেগম	আলী মোল্লা	\N	\N	\N	\N	Bangladeshi	\N	\N	Islam	\N	\N	খুলনা	বাগেরহাট	চিতলমারী	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.633569+06	2026-05-07 16:22:34.633569+06
\.


--
-- Data for Name: centers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.centers (id, center_name, center_name_bn, center_type, location, address, is_hq, created_at, updated_at) FROM stdin;
1	DSS Head Office Agargaon	ডিএসএস হেড অফিস আগারগাঁও	HQ	Dhaka	Agargaon, Dhaka	yes	2026-05-07 16:22:14.773126+06	2026-05-07 16:22:14.773126+06
2	Child Development Center (Boys) Tongi	শিশু উন্নয়ন কেন্দ্র (বালক), টঙ্গী, গাজীপুর	Boys	Tongi	Tongi, Gazipur	no	2026-05-07 16:22:14.773126+06	2026-05-07 16:22:14.773126+06
3	Child Development Center (Girls) Konabari	শিশু উন্নয়ন কেন্দ্র (বালিকা), কোনাবাড়ী, গাজীপুর	Girls	Konabari	Konabari, Gazipur	no	2026-05-07 16:22:14.773126+06	2026-05-07 16:22:14.773126+06
4	Child Development Center (Boys) Fulerhat	শিশু উন্নয়ন কেন্দ্র (বালক), ফুলেরহাট, যশোর	Boys	Jashore	Fulerhat, Jashore	no	2026-05-07 16:22:14.773126+06	2026-05-07 16:22:14.773126+06
\.


--
-- Data for Name: children; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.children (id, child_id, center_id, full_name, mother_name, father_name, gender, date_of_birth, age_at_admission, verified_age, verified_age_date, verified_dob, birth_registration_no, birth_certificate_file_name, birth_certificate_file_data_url, profile_image_file_name, profile_image_data_url, religion, nationality, present_division, present_district, present_upazila, present_village, present_address, permanent_division, permanent_district, permanent_upazila, permanent_village, permanent_address, admission_date, arrival_district, admission_source, legal_context, judicial_status, education_level, skills, future_goal, child_risk, parents_education, parents_occupation, parents_monthly_income, socioeconomic_status, parents_contact_number, child_relationship_with_parents, siblings_count_and_order, is_married, children_count, family_type, parents_marital_status, guardian_type, is_orphan, family_member_substance_abuse, family_criminal_involvement, peer_circle_info, basic_needs_fulfilled, basic_needs_note, safety_ensured, safety_ensured_note, initial_health_check_completed, initial_health_check_note, court_reference_no, case_type, current_status, created_at, updated_at) FROM stdin;
1	CHILD-2026-00001	2	মোহাম্মদ রাফি হাসান	নাজমা বেগম	মোহাম্মদ করিম হাসান	Boy	2012-03-18	12	\N	\N	2012-03-18	\N	\N	\N	\N	\N	Islam	Bangladeshi	ঢাকা	গাজীপুর	টঙ্গি	টঙ্গি গ্রাম	টঙ্গি, গাজীপুর	ঢাকা	গাজীপুর	টঙ্গি	টঙ্গি গ্রাম	গ্রাম: টঙ্গি, থানা: গাজীপুর	2024-04-02	গাজীপুর	আদালতের নির্দেশে	Child in Conflict with Law	Under Trial	Class 3	Basic literacy, handicrafts	Continue education and vocational development	Medium	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	f	f	f	\N	f	\N	f	\N	f	\N	CR-2026-0001	Juvenile Offence	Admitted	2026-05-07 16:22:32.626516+06	2026-05-07 16:22:32.626516+06
2	CHILD-2026-00002	2	আরিফুল ইসলাম	রহিমা বেগম	আবদুল করিম	Boy	2011-02-12	13	\N	\N	2011-02-12	\N	\N	\N	\N	\N	Islam	Bangladeshi	ঢাকা	নারায়ণগঞ্জ	রূপগঞ্জ	রূপগঞ্জ গ্রাম	রূপগঞ্জ, নারায়ণগঞ্জ	ঢাকা	নারায়ণগঞ্জ	রূপগঞ্জ	রূপগঞ্জ গ্রাম	গ্রাম: রূপগঞ্জ, থানা: নারায়ণগঞ্জ	2024-08-10	নারায়ণগঞ্জ	পুলিশ হেফাজত থেকে	Child in Contact with Law	Safe Custody	Class 5	Basic literacy, handicrafts	Continue education and vocational development	High	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	f	f	f	\N	f	\N	f	\N	f	\N	CR-2026-0002	Neglect	Admitted	2026-05-07 16:22:32.741248+06	2026-05-07 16:22:32.741248+06
3	CHILD-2026-00003	2	সাইফুল রহমান	হাসিনা বেগম	রফিকুল রহমান	Boy	2013-04-27	11	\N	\N	2013-04-27	\N	\N	\N	\N	\N	Islam	Bangladeshi	ঢাকা	গাজীপুর	কালীগঞ্জ	কালীগঞ্জ গ্রাম	কালীগঞ্জ, গাজীপুর	ঢাকা	গাজীপুর	কালীগঞ্জ	কালীগঞ্জ গ্রাম	গ্রাম: কালীগঞ্জ, থানা: গাজীপুর	2024-01-23	গাজীপুর	আদালতের নির্দেশে	Child in Contact with Law	Safe Custody	Class 8	Basic literacy, handicrafts	Continue education and vocational development	High	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	f	f	f	\N	f	\N	f	\N	f	\N	CR-2026-0003	Abuse	Admitted	2026-05-07 16:22:32.832043+06	2026-05-07 16:22:32.832043+06
4	CHILD-2026-00004	2	জুনায়েদ আহমেদ	সুফিয়া আহমেদ	মোহাম্মদ ইকবাল আহমেদ	Boy	2010-01-10	14	\N	\N	2010-01-10	\N	\N	\N	\N	\N	Islam	Bangladeshi	ঢাকা	ঢাকা	দেমড়া	দেমড়া গ্রাম	দেমড়া, ঢাকা	ঢাকা	ঢাকা	দেমড়া	দেমড়া গ্রাম	গ্রাম: দেমড়া, থানা: ঢাকা	2024-04-02	ঢাকা	সমাজসেবা অধিদফতর	Child in Contact with Law	Safe Custody	Class 5	Drawing, football	Continue education and vocational development	Low	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	f	f	f	\N	f	\N	f	\N	f	\N	CR-2026-0004	Abandoned	Admitted	2026-05-07 16:22:32.889578+06	2026-05-07 16:22:32.889578+06
5	CHILD-2026-00005	2	রিদওয়ান হোসেন	মরিয়ম হোসেন	আলী হোসেন	Boy	2014-05-23	10	\N	\N	2014-05-23	\N	\N	\N	\N	\N	Islam	Bangladeshi	ঢাকা	গাজীপুর	শ্রীপুর	শ্রীপুর গ্রাম	শ্রীপুর, গাজীপুর	ঢাকা	গাজীপুর	শ্রীপুর	শ্রীপুর গ্রাম	গ্রাম: শ্রীপুর, থানা: গাজীপুর	2024-06-21	গাজীপুর	আদালতের নির্দেশে	Child in Conflict with Law	Under Trial	Class 3	Basic literacy, handicrafts	Return to school and become self-reliant	Medium	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	f	f	f	\N	f	\N	f	\N	f	\N	CR-2026-0005	Juvenile Offence	Admitted	2026-05-07 16:22:32.969287+06	2026-05-07 16:22:32.969287+06
6	CHILD-2026-00006	2	তামিম খান	পারভিন বেগম	মাহমুদুল খান	Boy	2011-03-05	13	\N	\N	2011-03-05	\N	\N	\N	\N	\N	Islam	Bangladeshi	ঢাকা	কিশোরগঞ্জ	ভৈরব	ভৈরব গ্রাম	ভৈরব, কিশোরগঞ্জ	ঢাকা	কিশোরগঞ্জ	ভৈরব	ভৈরব গ্রাম	গ্রাম: ভৈরব, থানা: কিশোরগঞ্জ	2024-11-18	কিশোরগঞ্জ	পুলিশ হেফাজত থেকে	Child in Contact with Law	Safe Custody	Class 8	Basic literacy, handicrafts	Continue education and vocational development	Medium	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	f	f	f	\N	f	\N	f	\N	f	\N	CR-2026-0006	Neglect	Admitted	2026-05-07 16:22:33.050691+06	2026-05-07 16:22:33.050691+06
7	CHILD-2026-00007	2	নাফিউজ্জামান	আমেনা বেগম	নুরুজ্জামান	Boy	2008-06-01	15	\N	\N	2008-06-01	\N	\N	\N	\N	\N	Islam	Bangladeshi	ঢাকা	গাজীপুর	টঙ্গি	টঙ্গি গ্রাম	টঙ্গি, গাজীপুর	ঢাকা	গাজীপুর	টঙ্গি	টঙ্গি গ্রাম	গ্রাম: টঙ্গি, থানা: গাজীপুর	2023-07-07	গাজীপুর	আদালতের নির্দেশে	Child in Conflict with Law	Under Trial	Class 3	Basic literacy, handicrafts	Continue education and vocational development	Medium	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	f	f	f	\N	f	\N	f	\N	f	\N	CR-2026-0007	Juvenile Offence	Admitted	2026-05-07 16:22:33.142279+06	2026-05-07 16:22:33.142279+06
8	CHILD-2026-00008	2	শফিউল আলম	রুকাইয়া খাতুন	শামসুল আলম	Boy	2008-04-27	15	\N	\N	2008-04-27	\N	\N	\N	\N	\N	Islam	Bangladeshi	ঢাকা	মানিকগঞ্জ	সিংগাইর	সিংগাইর গ্রাম	সিংগাইর, মানিকগঞ্জ	ঢাকা	মানিকগঞ্জ	সিংগাইর	সিংগাইর গ্রাম	গ্রাম: সিংগাইর, থানা: মানিকগঞ্জ	2023-03-29	মানিকগঞ্জ	সমাজসেবা অধিদফতর	Child in Contact with Law	Safe Custody	Class 5	Drawing, football	Continue education and vocational development	High	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	f	f	f	\N	f	\N	f	\N	f	\N	CR-2026-0008	Abuse	Admitted	2026-05-07 16:22:33.297379+06	2026-05-07 16:22:33.297379+06
9	CHILD-2026-00009	2	হাবিবুর রহমান	জরিনা বেগম	হারুনুর রশিদ	Boy	2008-07-02	15	\N	\N	2008-07-02	\N	\N	\N	\N	\N	Islam	Bangladeshi	ঢাকা	গাজীপুর	টঙ্গি	টঙ্গি গ্রাম	টঙ্গি, গাজীপুর	ঢাকা	গাজীপুর	টঙ্গি	টঙ্গি গ্রাম	গ্রাম: টঙ্গি, থানা: গাজীপুর	2023-04-03	গাজীপুর	আদালতের নির্দেশে	Child in Conflict with Law	Under Trial	Class 8	Basic literacy, handicrafts	Continue education and vocational development	High	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	f	f	f	\N	f	\N	f	\N	f	\N	CR-2026-0009	Juvenile Offence	Admitted	2026-05-07 16:22:33.393417+06	2026-05-07 16:22:33.393417+06
10	CHILD-2026-00010	2	ইমরান হাসান	নার্গিস বেগম	মোস্তফা হাসান	Boy	2008-12-02	14	\N	\N	2008-12-02	\N	\N	\N	\N	\N	Islam	Bangladeshi	ঢাকা	ঢাকা	গুলশান	গুলশান গ্রাম	গুলশান, ঢাকা	ঢাকা	ঢাকা	গুলশান	গুলশান গ্রাম	গ্রাম: গুলশান, থানা: ঢাকা	2024-11-18	ঢাকা	আদালতের নির্দেশে	Child in Contact with Law	Safe Custody	Class 5	Basic literacy, handicrafts	Return to school and become self-reliant	Low	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	f	f	f	\N	f	\N	f	\N	f	\N	CR-2026-0010	Neglect	Released	2026-05-07 16:22:33.438999+06	2026-05-07 16:22:33.438999+06
11	CHILD-2026-00026	3	ফারিয়া বেগম	মোসাম্মৎ নার্গিস	আলমগীর হোসেন	Girl	2012-04-24	12	\N	\N	2012-04-24	\N	\N	\N	\N	\N	Islam	Bangladeshi	ঢাকা	গাজীপুর	কোনাবাড়ি	কোনাবাড়ি গ্রাম	কোনাবাড়ি, গাজীপুর	ঢাকা	গাজীপুর	কোনাবাড়ি	কোনাবাড়ি গ্রাম	গ্রাম: কোনাবাড়ি, থানা: গাজীপুর	2024-04-02	গাজীপুর	আদালতের নির্দেশে	Child in Contact with Law	Safe Custody	Class 5	Basic literacy, handicrafts	Continue education and vocational development	High	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	f	f	f	\N	f	\N	f	\N	f	\N	CR-2026-0026	Abuse	Admitted	2026-05-07 16:22:33.522367+06	2026-05-07 16:22:33.522367+06
12	CHILD-2026-00027	3	নাজমা খাতুন	বেগম রোকেয়া	জাহাঙ্গীর আলম	Girl	2013-02-07	11	\N	\N	2013-02-07	\N	\N	\N	\N	\N	Islam	Bangladeshi	ময়মনসিংহ	ময়মনসিংহ	ত্রিশাল	ত্রিশাল গ্রাম	ত্রিশাল, ময়মনসিংহ	ময়মনসিংহ	ময়মনসিংহ	ত্রিশাল	ত্রিশাল গ্রাম	গ্রাম: ত্রিশাল, থানা: ময়মনসিংহ	2024-08-10	ময়মনসিংহ	সমাজসেবা অধিদফতর	Child in Contact with Law	Safe Custody	Class 8	Basic literacy, handicrafts	Continue education and vocational development	Medium	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	f	f	f	\N	f	\N	f	\N	f	\N	CR-2026-0027	Neglect	Admitted	2026-05-07 16:22:33.567076+06	2026-05-07 16:22:33.567076+06
13	CHILD-2026-00028	3	সাবিনা ইয়াসমিন	হাসনা হেনা	আব্দুল লতিফ	Girl	2011-03-14	13	\N	\N	2011-03-14	\N	\N	\N	\N	\N	Islam	Bangladeshi	ময়মনসিংহ	শেরপুর	নালিতাবাড়ী	নালিতাবাড়ী গ্রাম	নালিতাবাড়ী, শেরপুর	ময়মনসিংহ	শেরপুর	নালিতাবাড়ী	নালিতাবাড়ী গ্রাম	গ্রাম: নালিতাবাড়ী, থানা: শেরপুর	2024-04-02	শেরপুর	পুলিশ হেফাজত থেকে	Child in Contact with Law	Safe Custody	Class 5	Drawing, football	Continue education and vocational development	High	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	f	f	f	\N	f	\N	f	\N	f	\N	CR-2026-0028	Trafficking	Admitted	2026-05-07 16:22:33.613493+06	2026-05-07 16:22:33.613493+06
14	CHILD-2026-00029	3	রেহানা পারভিন	রোকসানা বেগম	মতিউর রহমান	Girl	2010-05-30	14	\N	\N	2010-05-30	\N	\N	\N	\N	\N	Islam	Bangladeshi	ময়মনসিংহ	নেত্রকোণা	কেন্দুয়া	কেন্দুয়া গ্রাম	কেন্দুয়া, নেত্রকোণা	ময়মনসিংহ	নেত্রকোণা	কেন্দুয়া	কেন্দুয়া গ্রাম	গ্রাম: কেন্দুয়া, থানা: নেত্রকোণা	2024-01-23	নেত্রকোণা	আদালতের নির্দেশে	Child in Contact with Law	Safe Custody	Class 3	Basic literacy, handicrafts	Continue education and vocational development	Low	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	f	f	f	\N	f	\N	f	\N	f	\N	CR-2026-0029	Abandoned	Admitted	2026-05-07 16:22:33.680699+06	2026-05-07 16:22:33.680699+06
15	CHILD-2026-00030	3	আয়েশা সিদ্দিকা	জাহানারা বেগম	আবুল কাসেম	Girl	2014-04-20	10	\N	\N	2014-04-20	\N	\N	\N	\N	\N	Islam	Bangladeshi	ঢাকা	গাজীপুর	কালিয়াকৈর	কালিয়াকৈর গ্রাম	কালিয়াকৈর, গাজীপুর	ঢাকা	গাজীপুর	কালিয়াকৈর	কালিয়াকৈর গ্রাম	গ্রাম: কালিয়াকৈর, থানা: গাজীপুর	2024-03-13	গাজীপুর	সমাজসেবা অধিদফতর	Child in Contact with Law	Safe Custody	Class 8	Basic literacy, handicrafts	Return to school and become self-reliant	Medium	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	f	f	f	\N	f	\N	f	\N	f	\N	CR-2026-0030	Abuse	Admitted	2026-05-07 16:22:33.751915+06	2026-05-07 16:22:33.751915+06
16	CHILD-2026-00031	3	সুমাইয়া আক্তার	আক্লিমা বেগম	সিরাজুল ইসলাম	Girl	2008-05-17	14	\N	\N	2008-05-17	\N	\N	\N	\N	\N	Islam	Bangladeshi	রংপুর	কুড়িগ্রাম	ভুরুঙ্গামারী	ভুরুঙ্গামারী গ্রাম	ভুরুঙ্গামারী, কুড়িগ্রাম	রংপুর	কুড়িগ্রাম	ভুরুঙ্গামারী	ভুরুঙ্গামারী গ্রাম	গ্রাম: ভুরুঙ্গামারী, থানা: কুড়িগ্রাম	2023-03-29	কুড়িগ্রাম	পুলিশ হেফাজত থেকে	Child in Contact with Law	Safe Custody	Class 3	Basic literacy, handicrafts	Continue education and vocational development	High	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	f	f	f	\N	f	\N	f	\N	f	\N	CR-2026-0031	Trafficking	Admitted	2026-05-07 16:22:33.82644+06	2026-05-07 16:22:33.82644+06
17	CHILD-2026-00032	3	মারিয়াম বেগম	হনুফা বেগম	মোখলেসুর রহমান	Girl	2008-05-07	15	\N	\N	2008-05-07	\N	\N	\N	\N	\N	Islam	Bangladeshi	ময়মনসিংহ	জামালপুর	মেলান্দহ	মেলান্দহ গ্রাম	মেলান্দহ, জামালপুর	ময়মনসিংহ	জামালপুর	মেলান্দহ	মেলান্দহ গ্রাম	গ্রাম: মেলান্দহ, থানা: জামালপুর	2023-04-03	জামালপুর	আদালতের নির্দেশে	Child in Contact with Law	Safe Custody	Class 5	Drawing, football	Continue education and vocational development	High	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	f	f	f	\N	f	\N	f	\N	f	\N	CR-2026-0032	Abuse	Admitted	2026-05-07 16:22:33.923569+06	2026-05-07 16:22:33.923569+06
18	CHILD-2026-00033	3	তাসমিয়া ইসলাম	সুলতানা রাজিয়া	আব্বাস আলী	Girl	2012-01-09	12	\N	\N	2012-01-09	\N	\N	\N	\N	\N	Islam	Bangladeshi	ঢাকা	গাজীপুর	কোনাবাড়ি	কোনাবাড়ি গ্রাম	কোনাবাড়ি, গাজীপুর	ঢাকা	গাজীপুর	কোনাবাড়ি	কোনাবাড়ি গ্রাম	গ্রাম: কোনাবাড়ি, থানা: গাজীপুর	2024-08-10	গাজীপুর	সমাজসেবা অধিদফতর	Child in Contact with Law	Safe Custody	Class 8	Basic literacy, handicrafts	Continue education and vocational development	Low	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	f	f	f	\N	f	\N	f	\N	f	\N	CR-2026-0033	Neglect	Transferred	2026-05-07 16:22:34.00626+06	2026-05-07 16:22:34.00626+06
19	CHILD-2026-00049	4	রাকিব হাসান	রোজিনা বেগম	আবুল হাসেম	Boy	2011-03-22	13	\N	\N	2011-03-22	\N	\N	\N	\N	\N	Islam	Bangladeshi	খুলনা	যশোর	ফুলেরহাট	ফুলেরহাট গ্রাম	ফুলেরহাট, যশোর	খুলনা	যশোর	ফুলেরহাট	ফুলেরহাট গ্রাম	গ্রাম: ফুলেরহাট, থানা: যশোর	2024-04-02	যশোর	আদালতের নির্দেশে	Child in Conflict with Law	Under Trial	Class 3	Basic literacy, handicrafts	Continue education and vocational development	Medium	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	f	f	f	\N	f	\N	f	\N	f	\N	CR-2026-0049	Juvenile Offence	Admitted	2026-05-07 16:22:34.141292+06	2026-05-07 16:22:34.141292+06
20	CHILD-2026-00050	4	আসিফ ইসলাম	সেলিনা বেগম	সাজেদুল ইসলাম	Boy	2010-05-23	14	\N	\N	2010-05-23	\N	\N	\N	\N	\N	Islam	Bangladeshi	খুলনা	সাতক্ষীরা	শ্যামনগর	শ্যামনগর গ্রাম	শ্যামনগর, সাতক্ষীরা	খুলনা	সাতক্ষীরা	শ্যামনগর	শ্যামনগর গ্রাম	গ্রাম: শ্যামনগর, থানা: সাতক্ষীরা	2024-06-21	সাতক্ষীরা	পুলিশ হেফাজত থেকে	Child in Contact with Law	Safe Custody	Class 5	Basic literacy, handicrafts	Return to school and become self-reliant	High	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	f	f	f	\N	f	\N	f	\N	f	\N	CR-2026-0050	Neglect	Admitted	2026-05-07 16:22:34.221212+06	2026-05-07 16:22:34.221212+06
21	CHILD-2026-00051	4	মামুন রহমান	মাহফুজা বেগম	মোহাম্মদ ইউসুফ	Boy	2013-03-13	11	\N	\N	2013-03-13	\N	\N	\N	\N	\N	Islam	Bangladeshi	খুলনা	খুলনা	ডুমুরিয়া	ডুমুরিয়া গ্রাম	ডুমুরিয়া, খুলনা	খুলনা	খুলনা	ডুমুরিয়া	ডুমুরিয়া গ্রাম	গ্রাম: ডুমুরিয়া, থানা: খুলনা	2024-01-23	খুলনা	সমাজসেবা অধিদফতর	Child in Contact with Law	Safe Custody	Class 8	Basic literacy, handicrafts	Continue education and vocational development	Low	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	f	f	f	\N	f	\N	f	\N	f	\N	CR-2026-0051	Abandoned	Admitted	2026-05-07 16:22:34.296875+06	2026-05-07 16:22:34.296875+06
22	CHILD-2026-00052	4	সোহেল রানা	কহিনুর বেগম	মজনু মিয়া	Boy	2012-02-17	12	\N	\N	2012-02-17	\N	\N	\N	\N	\N	Islam	Bangladeshi	খুলনা	নড়াইল	লোহাগড়া	লোহাগড়া গ্রাম	লোহাগড়া, নড়াইল	খুলনা	নড়াইল	লোহাগড়া	লোহাগড়া গ্রাম	গ্রাম: লোহাগড়া, থানা: নড়াইল	2024-03-13	নড়াইল	আদালতের নির্দেশে	Child in Conflict with Law	Under Trial	Class 5	Drawing, football	Continue education and vocational development	Medium	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	f	f	f	\N	f	\N	f	\N	f	\N	CR-2026-0052	Juvenile Offence	Admitted	2026-05-07 16:22:34.370598+06	2026-05-07 16:22:34.370598+06
23	CHILD-2026-00053	4	সাজিদুল ইসলাম	তাহমিনা বেগম	বাবুল ইসলাম	Boy	2008-04-20	15	\N	\N	2008-04-20	\N	\N	\N	\N	\N	Islam	Bangladeshi	খুলনা	যশোর	কেশবপুর	কেশবপুর গ্রাম	কেশবপুর, যশোর	খুলনা	যশোর	কেশবপুর	কেশবপুর গ্রাম	গ্রাম: কেশবপুর, থানা: যশোর	2023-04-03	যশোর	আদালতের নির্দেশে	Child in Conflict with Law	Under Trial	Class 3	Basic literacy, handicrafts	Continue education and vocational development	High	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	f	f	f	\N	f	\N	f	\N	f	\N	CR-2026-0053	Juvenile Offence	Admitted	2026-05-07 16:22:34.459812+06	2026-05-07 16:22:34.459812+06
24	CHILD-2026-00054	4	কামরুল হাসান	মেহেরুন নেসা	কামাল হোসেন	Boy	2008-10-02	14	\N	\N	2008-10-02	\N	\N	\N	\N	\N	Islam	Bangladeshi	খুলনা	যশোর	বাঘারপাড়া	বাঘারপাড়া গ্রাম	বাঘারপাড়া, যশোর	খুলনা	যশোর	বাঘারপাড়া	বাঘারপাড়া গ্রাম	গ্রাম: বাঘারপাড়া, থানা: যশোর	2022-04-03	যশোর	আদালতের নির্দেশে	Child in Conflict with Law	Under Trial	Class 8	Basic literacy, handicrafts	Continue education and vocational development	High	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	f	f	f	\N	f	\N	f	\N	f	\N	CR-2026-0054	Juvenile Offence	Admitted	2026-05-07 16:22:34.5441+06	2026-05-07 16:22:34.5441+06
25	CHILD-2026-00055	4	ইব্রাহিম মোল্লা	মমতাজ বেগম	আলী মোল্লা	Boy	2010-04-27	13	\N	\N	2010-04-27	\N	\N	\N	\N	\N	Islam	Bangladeshi	খুলনা	বাগেরহাট	চিতলমারী	চিতলমারী গ্রাম	চিতলমারী, বাগেরহাট	খুলনা	বাগেরহাট	চিতলমারী	চিতলমারী গ্রাম	গ্রাম: চিতলমারী, থানা: বাগেরহাট	2024-08-10	বাগেরহাট	সমাজসেবা অধিদফতর	Child in Contact with Law	Safe Custody	Class 3	Basic literacy, handicrafts	Return to school and become self-reliant	Low	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	f	f	f	\N	f	\N	f	\N	f	\N	CR-2026-0055	Neglect	Released	2026-05-07 16:22:34.62551+06	2026-05-07 16:22:34.62551+06
26	CHILD-2026-77798	3	Ayra	\N	\N	Girl	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N		Bangladeshi				\N	\N				\N	\N	2026-05-07	\N	court order	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N				f	f	f	\N	f	\N	f	\N	f	\N	\N		Draft	2026-05-07 16:40:24.114148+06	2026-05-07 16:40:24.186+06
\.


--
-- Data for Name: classes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.classes (id, name_bn, name_en, is_active, created_at, updated_at) FROM stdin;
1	১ম শ্রেণি	Class 1	t	2026-05-07 16:22:32.598841+06	2026-05-07 16:22:32.598841+06
2	২য় শ্রেণি	Class 2	t	2026-05-07 16:22:32.598841+06	2026-05-07 16:22:32.598841+06
3	৩য় শ্রেণি	Class 3	t	2026-05-07 16:22:32.598841+06	2026-05-07 16:22:32.598841+06
4	৪র্থ শ্রেণি	Class 4	t	2026-05-07 16:22:32.598841+06	2026-05-07 16:22:32.598841+06
5	৫ম শ্রেণি	Class 5	t	2026-05-07 16:22:32.598841+06	2026-05-07 16:22:32.598841+06
6	৬ষ্ঠ শ্রেণি	Class 6	t	2026-05-07 16:22:32.598841+06	2026-05-07 16:22:32.598841+06
7	৭ম শ্রেণি	Class 7	t	2026-05-07 16:22:32.598841+06	2026-05-07 16:22:32.598841+06
8	৮ম শ্রেণি	Class 8	t	2026-05-07 16:22:32.598841+06	2026-05-07 16:22:32.598841+06
9	৯ম শ্রেণি	Class 9	t	2026-05-07 16:22:32.598841+06	2026-05-07 16:22:32.598841+06
10	১০ম শ্রেণি	Class 10	t	2026-05-07 16:22:32.598841+06	2026-05-07 16:22:32.598841+06
11	ও লেভেল	O Level	t	2026-05-07 16:22:32.598841+06	2026-05-07 16:22:32.598841+06
12	এ লেভেল	A Level	t	2026-05-07 16:22:32.598841+06	2026-05-07 16:22:32.598841+06
\.


--
-- Data for Name: counseling_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.counseling_sessions (id, session_id, child_id, session_date, counselor, session_type, issues_discussed, observations, outcome, next_session_date, created_at, updated_at) FROM stdin;
1	CS-2026-00010	1	2026-03-03	\N	Individual	\N	\N	\N	2026-04-17	2026-05-07 16:22:32.67854+06	2026-05-07 16:22:32.67854+06
2	CS-2026-00011	1	2026-03-18	\N	Group	\N	\N	\N	2026-05-02	2026-05-07 16:22:32.684003+06	2026-05-07 16:22:32.684003+06
3	CS-2026-00020	2	2026-03-03	\N	Individual	\N	\N	\N	2026-04-17	2026-05-07 16:22:32.780162+06	2026-05-07 16:22:32.780162+06
4	CS-2026-00021	2	2026-03-18	\N	Group	\N	\N	\N	2026-05-02	2026-05-07 16:22:32.784865+06	2026-05-07 16:22:32.784865+06
5	CS-2026-00030	3	2026-03-03	\N	Individual	\N	\N	\N	2026-04-17	2026-05-07 16:22:32.855043+06	2026-05-07 16:22:32.855043+06
6	CS-2026-00031	3	2026-03-18	\N	Group	\N	\N	\N	2026-05-02	2026-05-07 16:22:32.858029+06	2026-05-07 16:22:32.858029+06
7	CS-2026-00040	4	2026-03-03	\N	Individual	\N	\N	\N	2026-04-17	2026-05-07 16:22:32.920657+06	2026-05-07 16:22:32.920657+06
8	CS-2026-00041	4	2026-03-18	\N	Group	\N	\N	\N	2026-05-02	2026-05-07 16:22:32.924608+06	2026-05-07 16:22:32.924608+06
9	CS-2026-00050	5	2026-03-03	\N	Individual	\N	\N	\N	2026-04-17	2026-05-07 16:22:33.004361+06	2026-05-07 16:22:33.004361+06
10	CS-2026-00051	5	2026-03-18	\N	Group	\N	\N	\N	2026-05-02	2026-05-07 16:22:33.008378+06	2026-05-07 16:22:33.008378+06
11	CS-2026-00060	6	2026-03-03	\N	Individual	\N	\N	\N	2026-04-17	2026-05-07 16:22:33.089694+06	2026-05-07 16:22:33.089694+06
12	CS-2026-00061	6	2026-03-18	\N	Group	\N	\N	\N	2026-05-02	2026-05-07 16:22:33.093901+06	2026-05-07 16:22:33.093901+06
13	CS-2026-00070	7	2026-03-03	\N	Individual	\N	\N	\N	2026-04-17	2026-05-07 16:22:33.179377+06	2026-05-07 16:22:33.179377+06
14	CS-2026-00071	7	2026-03-18	\N	Group	\N	\N	\N	2026-05-02	2026-05-07 16:22:33.184206+06	2026-05-07 16:22:33.184206+06
15	CS-2026-00080	8	2026-03-03	\N	Individual	\N	\N	\N	2026-04-17	2026-05-07 16:22:33.369064+06	2026-05-07 16:22:33.369064+06
16	CS-2026-00081	8	2026-03-18	\N	Group	\N	\N	\N	2026-05-02	2026-05-07 16:22:33.371511+06	2026-05-07 16:22:33.371511+06
17	CS-2026-00090	9	2026-03-03	\N	Individual	\N	\N	\N	2026-04-17	2026-05-07 16:22:33.411773+06	2026-05-07 16:22:33.411773+06
18	CS-2026-00091	9	2026-03-18	\N	Group	\N	\N	\N	2026-05-02	2026-05-07 16:22:33.414438+06	2026-05-07 16:22:33.414438+06
19	CS-2026-00100	10	2026-03-03	\N	Individual	\N	\N	\N	\N	2026-05-07 16:22:33.456751+06	2026-05-07 16:22:33.456751+06
20	CS-2026-00101	10	2026-03-18	\N	Group	\N	\N	\N	\N	2026-05-07 16:22:33.459068+06	2026-05-07 16:22:33.459068+06
21	CS-2026-00260	11	2026-03-03	\N	Individual	\N	\N	\N	2026-04-17	2026-05-07 16:22:33.540296+06	2026-05-07 16:22:33.540296+06
22	CS-2026-00261	11	2026-03-18	\N	Group	\N	\N	\N	2026-05-02	2026-05-07 16:22:33.542832+06	2026-05-07 16:22:33.542832+06
23	CS-2026-00270	12	2026-03-03	\N	Individual	\N	\N	\N	2026-04-17	2026-05-07 16:22:33.58517+06	2026-05-07 16:22:33.58517+06
24	CS-2026-00271	12	2026-03-18	\N	Group	\N	\N	\N	2026-05-02	2026-05-07 16:22:33.587569+06	2026-05-07 16:22:33.587569+06
25	CS-2026-00280	13	2026-03-03	\N	Individual	\N	\N	\N	2026-04-17	2026-05-07 16:22:33.637983+06	2026-05-07 16:22:33.637983+06
26	CS-2026-00281	13	2026-03-18	\N	Group	\N	\N	\N	2026-05-02	2026-05-07 16:22:33.641321+06	2026-05-07 16:22:33.641321+06
27	CS-2026-00290	14	2026-03-03	\N	Individual	\N	\N	\N	2026-04-17	2026-05-07 16:22:33.711011+06	2026-05-07 16:22:33.711011+06
28	CS-2026-00291	14	2026-03-18	\N	Group	\N	\N	\N	2026-05-02	2026-05-07 16:22:33.715583+06	2026-05-07 16:22:33.715583+06
29	CS-2026-00300	15	2026-03-03	\N	Individual	\N	\N	\N	2026-04-17	2026-05-07 16:22:33.783564+06	2026-05-07 16:22:33.783564+06
30	CS-2026-00301	15	2026-03-18	\N	Group	\N	\N	\N	2026-05-02	2026-05-07 16:22:33.787762+06	2026-05-07 16:22:33.787762+06
31	CS-2026-00310	16	2026-03-03	\N	Individual	\N	\N	\N	2026-04-17	2026-05-07 16:22:33.860547+06	2026-05-07 16:22:33.860547+06
32	CS-2026-00311	16	2026-03-18	\N	Group	\N	\N	\N	2026-05-02	2026-05-07 16:22:33.866862+06	2026-05-07 16:22:33.866862+06
33	CS-2026-00320	17	2026-03-03	\N	Individual	\N	\N	\N	2026-04-17	2026-05-07 16:22:33.959512+06	2026-05-07 16:22:33.959512+06
34	CS-2026-00321	17	2026-03-18	\N	Group	\N	\N	\N	2026-05-02	2026-05-07 16:22:33.963552+06	2026-05-07 16:22:33.963552+06
35	CS-2026-00330	18	2026-03-03	\N	Individual	\N	\N	\N	\N	2026-05-07 16:22:34.043952+06	2026-05-07 16:22:34.043952+06
36	CS-2026-00331	18	2026-03-18	\N	Group	\N	\N	\N	\N	2026-05-07 16:22:34.048063+06	2026-05-07 16:22:34.048063+06
37	CS-2026-00490	19	2026-03-03	\N	Individual	\N	\N	\N	2026-04-17	2026-05-07 16:22:34.17567+06	2026-05-07 16:22:34.17567+06
38	CS-2026-00491	19	2026-03-18	\N	Group	\N	\N	\N	2026-05-02	2026-05-07 16:22:34.179771+06	2026-05-07 16:22:34.179771+06
39	CS-2026-00500	20	2026-03-03	\N	Individual	\N	\N	\N	2026-04-17	2026-05-07 16:22:34.25307+06	2026-05-07 16:22:34.25307+06
40	CS-2026-00501	20	2026-03-18	\N	Group	\N	\N	\N	2026-05-02	2026-05-07 16:22:34.256906+06	2026-05-07 16:22:34.256906+06
41	CS-2026-00510	21	2026-03-03	\N	Individual	\N	\N	\N	2026-04-17	2026-05-07 16:22:34.327013+06	2026-05-07 16:22:34.327013+06
42	CS-2026-00511	21	2026-03-18	\N	Group	\N	\N	\N	2026-05-02	2026-05-07 16:22:34.331207+06	2026-05-07 16:22:34.331207+06
43	CS-2026-00520	22	2026-03-03	\N	Individual	\N	\N	\N	2026-04-17	2026-05-07 16:22:34.413051+06	2026-05-07 16:22:34.413051+06
44	CS-2026-00521	22	2026-03-18	\N	Group	\N	\N	\N	2026-05-02	2026-05-07 16:22:34.41747+06	2026-05-07 16:22:34.41747+06
45	CS-2026-00530	23	2026-03-03	\N	Individual	\N	\N	\N	2026-04-17	2026-05-07 16:22:34.495895+06	2026-05-07 16:22:34.495895+06
46	CS-2026-00531	23	2026-03-18	\N	Group	\N	\N	\N	2026-05-02	2026-05-07 16:22:34.499679+06	2026-05-07 16:22:34.499679+06
47	CS-2026-00540	24	2026-03-03	\N	Individual	\N	\N	\N	2026-04-17	2026-05-07 16:22:34.5769+06	2026-05-07 16:22:34.5769+06
48	CS-2026-00541	24	2026-03-18	\N	Group	\N	\N	\N	2026-05-02	2026-05-07 16:22:34.581437+06	2026-05-07 16:22:34.581437+06
49	CS-2026-00550	25	2026-03-03	\N	Individual	\N	\N	\N	\N	2026-05-07 16:22:34.658095+06	2026-05-07 16:22:34.658095+06
50	CS-2026-00551	25	2026-03-18	\N	Group	\N	\N	\N	\N	2026-05-07 16:22:34.662438+06	2026-05-07 16:22:34.662438+06
\.


--
-- Data for Name: court_cases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.court_cases (id, court_case_id, child_id, court_name, police_station_name, gr_number, case_no, legal_section, legal_aid_type, hearing_date, last_hearing_date, lawyer_name, child_case_type, previous_case_involvement, outcome, next_hearing_date, fir_number, fir_date, current_case_status, court_attendance_details, court_attendance_dates, guardian_communication, education_training, center_facilities, case_comments, workflow_state, workflow_notes, sent_back_notes, submitted_by_id, reviewed_by_df_id, reviewed_by_probation_id, approved_by_id, created_at, updated_at) FROM stdin;
1	CRT-2026-00001	1	যুগ্ম দায়রা জজ আদালত, গাজীপুর	টঙ্গি থানা	GR-0001/2026	CR-2026/001	Penal Code 1860, Section 379	family_support	2026-01-30	2026-03-12	অ্যাডভোকেট মোহাম্মদ আলী	Juvenile Offence	f	পরবর্তী শুনানির তারিখ নির্ধারিত	2026-04-07	\N	\N	\N	\N	\N	\N	\N	\N	\N	Draft	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:32.649779+06	2026-05-07 16:22:32.649779+06
2	CRT-2026-00002	2	যুগ্ম দায়রা জজ আদালত, নারায়ণগঞ্জ	রূপগঞ্জ থানা	GR-0002/2026	CR-2026/002	Children Act 2013, Section 17	family_support	2026-01-28	2026-03-11	অ্যাডভোকেট মোহাম্মদ আলী	Neglect	f	পরবর্তী শুনানির তারিখ নির্ধারিত	2026-04-14	\N	\N	\N	\N	\N	\N	\N	\N	\N	Draft	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:32.76031+06	2026-05-07 16:22:32.76031+06
3	CRT-2026-00003	3	যুগ্ম দায়রা জজ আদালত, গাজীপুর	কালীগঞ্জ থানা	GR-0003/2026	CR-2026/003	Children Act 2013, Section 17	government_legal_aid	2026-01-26	2026-03-10	অ্যাডভোকেট মোহাম্মদ আলী	Abuse	f	পরবর্তী শুনানির তারিখ নির্ধারিত	2026-04-30	\N	\N	\N	\N	\N	\N	\N	\N	\N	Draft	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:32.841462+06	2026-05-07 16:22:32.841462+06
4	CRT-2026-00004	4	যুগ্ম দায়রা জজ আদালত, ঢাকা	দেমড়া থানা	GR-0004/2026	CR-2026/004	Children Act 2013, Section 17	family_support	2026-01-24	2026-03-09	অ্যাডভোকেট মোহাম্মদ আলী	Abandoned	f	পরবর্তী শুনানির তারিখ নির্ধারিত	2026-04-24	\N	\N	\N	\N	\N	\N	\N	\N	\N	Draft	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:32.90364+06	2026-05-07 16:22:32.90364+06
5	CRT-2026-00005	5	যুগ্ম দায়রা জজ আদালত, গাজীপুর	শ্রীপুর থানা	GR-0005/2026	CR-2026/005	Penal Code 1860, Section 379	ngo_support	2026-01-22	2026-03-08	অ্যাডভোকেট মোহাম্মদ আলী	Juvenile Offence	f	পরবর্তী শুনানির তারিখ নির্ধারিত	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Draft	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:32.984952+06	2026-05-07 16:22:32.984952+06
6	CRT-2026-00006	6	যুগ্ম দায়রা জজ আদালত, কিশোরগঞ্জ	ভৈরব থানা	GR-0006/2026	CR-2026/006	Children Act 2013, Section 17	government_legal_aid	2026-01-20	2026-03-07	অ্যাডভোকেট মোহাম্মদ আলী	Neglect	t	পরবর্তী শুনানির তারিখ নির্ধারিত	2026-04-09	\N	\N	\N	\N	\N	\N	\N	\N	\N	Draft	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.069064+06	2026-05-07 16:22:33.069064+06
7	CRT-2026-00007	7	যুগ্ম দায়রা জজ আদালত, গাজীপুর	টঙ্গি থানা	GR-0007/2026	CR-2026/007	Penal Code 1860, Section 379	family_support	2026-01-18	2026-03-06	অ্যাডভোকেট মোহাম্মদ আলী	Juvenile Offence	f	পরবর্তী শুনানির তারিখ নির্ধারিত	2026-04-27	\N	\N	\N	\N	\N	\N	\N	\N	\N	Draft	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.159934+06	2026-05-07 16:22:33.159934+06
8	CRT-2026-00008	8	যুগ্ম দায়রা জজ আদালত, মানিকগঞ্জ	সিংগাইর থানা	GR-0008/2026	CR-2026/008	Children Act 2013, Section 17	family_support	2026-01-16	2026-03-05	অ্যাডভোকেট মোহাম্মদ আলী	Abuse	f	পরবর্তী শুনানির তারিখ নির্ধারিত	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Draft	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.333489+06	2026-05-07 16:22:33.333489+06
9	CRT-2026-00009	9	যুগ্ম দায়রা জজ আদালত, গাজীপুর	টঙ্গি থানা	GR-0009/2026	CR-2026/009	Penal Code 1860, Section 379	government_legal_aid	2026-01-14	2026-03-04	অ্যাডভোকেট মোহাম্মদ আলী	Juvenile Offence	f	পরবর্তী শুনানির তারিখ নির্ধারিত	2026-04-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	Draft	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.401533+06	2026-05-07 16:22:33.401533+06
10	CRT-2026-00010	10	যুগ্ম দায়রা জজ আদালত, ঢাকা	গুলশান থানা	GR-0010/2026	CR-2026/010	Children Act 2013, Section 17	ngo_support	2026-01-12	2026-03-03	অ্যাডভোকেট মোহাম্মদ আলী	Neglect	f	পরবর্তী শুনানির তারিখ নির্ধারিত	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Draft	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.446155+06	2026-05-07 16:22:33.446155+06
11	CRT-2026-00026	11	যুগ্ম দায়রা জজ আদালত, গাজীপুর	কোনাবাড়ি থানা	GR-0026/2026	CR-2026/026	Children Act 2013, Section 17	family_support	2025-12-11	2026-02-15	অ্যাডভোকেট মোহাম্মদ আলী	Abuse	f	পরবর্তী শুনানির তারিখ নির্ধারিত	2026-04-06	\N	\N	\N	\N	\N	\N	\N	\N	\N	Draft	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.529725+06	2026-05-07 16:22:33.529725+06
12	CRT-2026-00027	12	যুগ্ম দায়রা জজ আদালত, ময়মনসিংহ	ত্রিশাল থানা	GR-0027/2026	CR-2026/027	Children Act 2013, Section 17	government_legal_aid	2025-12-09	2026-02-14	অ্যাডভোকেট মোহাম্মদ আলী	Neglect	f	পরবর্তী শুনানির তারিখ নির্ধারিত	2026-04-20	\N	\N	\N	\N	\N	\N	\N	\N	\N	Draft	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.574243+06	2026-05-07 16:22:33.574243+06
13	CRT-2026-00028	13	যুগ্ম দায়রা জজ আদালত, শেরপুর	নালিতাবাড়ী থানা	GR-0028/2026	CR-2026/028	Children Act 2013, Section 17	family_support	2025-12-07	2026-02-13	অ্যাডভোকেট মোহাম্মদ আলী	Trafficking	f	পরবর্তী শুনানির তারিখ নির্ধারিত	2026-04-12	\N	\N	\N	\N	\N	\N	\N	\N	\N	Draft	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.623196+06	2026-05-07 16:22:33.623196+06
14	CRT-2026-00029	14	যুগ্ম দায়রা জজ আদালত, নেত্রকোণা	কেন্দুয়া থানা	GR-0029/2026	CR-2026/029	Children Act 2013, Section 17	family_support	2025-12-05	2026-02-12	অ্যাডভোকেট মোহাম্মদ আলী	Abandoned	f	পরবর্তী শুনানির তারিখ নির্ধারিত	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Draft	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.694283+06	2026-05-07 16:22:33.694283+06
15	CRT-2026-00030	15	যুগ্ম দায়রা জজ আদালত, গাজীপুর	কালিয়াকৈর থানা	GR-0030/2026	CR-2026/030	Children Act 2013, Section 17	ngo_support	2025-12-03	2026-02-11	অ্যাডভোকেট মোহাম্মদ আলী	Abuse	t	পরবর্তী শুনানির তারিখ নির্ধারিত	2026-04-22	\N	\N	\N	\N	\N	\N	\N	\N	\N	Draft	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.76687+06	2026-05-07 16:22:33.76687+06
16	CRT-2026-00031	16	যুগ্ম দায়রা জজ আদালত, কুড়িগ্রাম	ভুরুঙ্গামারী থানা	GR-0031/2026	CR-2026/031	Children Act 2013, Section 17	family_support	2025-12-01	2026-02-10	অ্যাডভোকেট মোহাম্মদ আলী	Trafficking	f	পরবর্তী শুনানির তারিখ নির্ধারিত	2026-04-17	\N	\N	\N	\N	\N	\N	\N	\N	\N	Draft	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.840536+06	2026-05-07 16:22:33.840536+06
17	CRT-2026-00032	17	যুগ্ম দায়রা জজ আদালত, জামালপুর	মেলান্দহ থানা	GR-0032/2026	CR-2026/032	Children Act 2013, Section 17	family_support	2025-11-29	2026-02-09	অ্যাডভোকেট মোহাম্মদ আলী	Abuse	f	পরবর্তী শুনানির তারিখ নির্ধারিত	2026-04-04	\N	\N	\N	\N	\N	\N	\N	\N	\N	Draft	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.94145+06	2026-05-07 16:22:33.94145+06
18	CRT-2026-00033	18	যুগ্ম দায়রা জজ আদালত, গাজীপুর	কোনাবাড়ি থানা	GR-0033/2026	CR-2026/033	Children Act 2013, Section 17	government_legal_aid	2025-11-27	2026-02-08	অ্যাডভোকেট মোহাম্মদ আলী	Neglect	f	পরবর্তী শুনানির তারিখ নির্ধারিত	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Draft	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.024483+06	2026-05-07 16:22:34.024483+06
19	CRT-2026-00049	19	যুগ্ম দায়রা জজ আদালত, যশোর	ফুলেরহাট থানা	GR-0049/2026	CR-2026/049	Penal Code 1860, Section 379	family_support	2025-10-26	2026-01-23	অ্যাডভোকেট মোহাম্মদ আলী	Juvenile Offence	f	পরবর্তী শুনানির তারিখ নির্ধারিত	2026-04-08	\N	\N	\N	\N	\N	\N	\N	\N	\N	Draft	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.158064+06	2026-05-07 16:22:34.158064+06
20	CRT-2026-00050	20	যুগ্ম দায়রা জজ আদালত, সাতক্ষীরা	শ্যামনগর থানা	GR-0050/2026	CR-2026/050	Children Act 2013, Section 17	ngo_support	2025-10-24	2026-01-22	অ্যাডভোকেট মোহাম্মদ আলী	Neglect	f	পরবর্তী শুনানির তারিখ নির্ধারিত	2026-04-16	\N	\N	\N	\N	\N	\N	\N	\N	\N	Draft	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.237+06	2026-05-07 16:22:34.237+06
21	CRT-2026-00051	21	যুগ্ম দায়রা জজ আদালত, খুলনা	ডুমুরিয়া থানা	GR-0051/2026	CR-2026/051	Children Act 2013, Section 17	government_legal_aid	2025-10-22	2026-01-21	অ্যাডভোকেট মোহাম্মদ আলী	Abandoned	f	পরবর্তী শুনানির তারিখ নির্ধারিত	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Draft	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.310416+06	2026-05-07 16:22:34.310416+06
22	CRT-2026-00052	22	যুগ্ম দায়রা জজ আদালত, নড়াইল	লোহাগড়া থানা	GR-0052/2026	CR-2026/052	Penal Code 1860, Section 379	family_support	2025-10-20	2026-01-20	অ্যাডভোকেট মোহাম্মদ আলী	Juvenile Offence	f	পরবর্তী শুনানির তারিখ নির্ধারিত	2026-04-26	\N	\N	\N	\N	\N	\N	\N	\N	\N	Draft	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.393756+06	2026-05-07 16:22:34.393756+06
23	CRT-2026-00053	23	যুগ্ম দায়রা জজ আদালত, যশোর	কেশবপুর থানা	GR-0053/2026	CR-2026/053	Penal Code 1860, Section 379	family_support	2025-10-18	2026-01-19	অ্যাডভোকেট মোহাম্মদ আলী	Juvenile Offence	f	পরবর্তী শুনানির তারিখ নির্ধারিত	2026-04-11	\N	\N	\N	\N	\N	\N	\N	\N	\N	Draft	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.477897+06	2026-05-07 16:22:34.477897+06
24	CRT-2026-00054	24	যুগ্ম দায়রা জজ আদালত, যশোর	বাঘারপাড়া থানা	GR-0054/2026	CR-2026/054	Penal Code 1860, Section 379	government_legal_aid	2025-10-16	2026-01-18	অ্যাডভোকেট মোহাম্মদ আলী	Juvenile Offence	t	পরবর্তী শুনানির তারিখ নির্ধারিত	2026-04-03	\N	\N	\N	\N	\N	\N	\N	\N	\N	Draft	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.558605+06	2026-05-07 16:22:34.558605+06
25	CRT-2026-00055	25	যুগ্ম দায়রা জজ আদালত, বাগেরহাট	চিতলমারী থানা	GR-0055/2026	CR-2026/055	Children Act 2013, Section 17	ngo_support	2025-10-14	2026-01-17	অ্যাডভোকেট মোহাম্মদ আলী	Neglect	f	পরবর্তী শুনানির তারিখ নির্ধারিত	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Draft	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.639501+06	2026-05-07 16:22:34.639501+06
\.


--
-- Data for Name: education_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.education_plans (id, plan_id, child_id, program_type, admission_eligible_for, case_details, recommender_case_worker_name, record_title, status, institution_name, start_date, end_date, education_level, board_or_curriculum, learning_goals, trade_name, certification_name, weekly_hours, assessment_date, assessor_name, literacy_level, numeracy_level, digital_literacy_level, interest_areas, strengths, support_needs, progress_notes, recommendations, created_at, updated_at) FROM stdin;
1	EDU-AF-00001	1	Admission Form	Grade 9	Requires basic literacy and numeracy support.	সজল কুমার দাস	Initial Admission Assessment	Completed	\N	2024-04-02	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:32.709174+06	2026-05-07 16:22:32.709174+06
2	EDU-ED-00001	1	Education	\N	\N	\N	Basic Education	Ongoing	CDC Primary School	2024-04-02	\N	Primary	National Curriculum	Improve reading and writing skills.	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Doing well in class.	\N	2026-05-07 16:22:32.715988+06	2026-05-07 16:22:32.715988+06
3	EDU-VC-00001	1	Vocational	\N	\N	\N	Computer Training	Ongoing	CDC Training Center	2024-04-02	\N	\N	\N	\N	IT	Basic Certificate	15	\N	\N	\N	\N	\N	\N	\N	\N	Learning basic skills quickly.	\N	2026-05-07 16:22:32.721414+06	2026-05-07 16:22:32.721414+06
4	EDU-SA-00001	1	Skills Assessment	\N	\N	\N	Initial Skills Assessment	Completed	\N	2024-04-02	\N	\N	\N	\N	\N	\N	\N	2024-04-02	সজল কুমার দাস	Basic	Basic	Emerging	Drawing, Sports	Quick learner	Individual attention	\N	Continue current plan.	2026-05-07 16:22:32.726495+06	2026-05-07 16:22:32.726495+06
5	EDU-AF-00002	2	Admission Form	Grade 8	Requires basic literacy and numeracy support.	সজল কুমার দাস	Initial Admission Assessment	Completed	\N	2024-08-10	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:32.807153+06	2026-05-07 16:22:32.807153+06
6	EDU-ED-00002	2	Education	\N	\N	\N	Basic Education	Ongoing	CDC Primary School	2024-08-10	\N	Primary	National Curriculum	Improve reading and writing skills.	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Doing well in class.	\N	2026-05-07 16:22:32.812233+06	2026-05-07 16:22:32.812233+06
7	EDU-VC-00002	2	Vocational	\N	\N	\N	Tailoring Course	Ongoing	CDC Training Center	2024-08-10	\N	\N	\N	\N	Tailoring	Basic Certificate	15	\N	\N	\N	\N	\N	\N	\N	\N	Learning basic skills quickly.	\N	2026-05-07 16:22:32.817722+06	2026-05-07 16:22:32.817722+06
8	EDU-SA-00002	2	Skills Assessment	\N	\N	\N	Initial Skills Assessment	Completed	\N	2024-08-10	\N	\N	\N	\N	\N	\N	\N	2024-08-10	সজল কুমার দাস	Basic	Basic	Emerging	Drawing, Sports	Quick learner	Individual attention	\N	Continue current plan.	2026-05-07 16:22:32.823536+06	2026-05-07 16:22:32.823536+06
9	EDU-AF-00003	3	Admission Form	Grade 9	Requires basic literacy and numeracy support.	সজল কুমার দাস	Initial Admission Assessment	Completed	\N	2024-01-23	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:32.870623+06	2026-05-07 16:22:32.870623+06
10	EDU-ED-00003	3	Education	\N	\N	\N	Basic Education	Ongoing	CDC Primary School	2024-01-23	\N	Primary	National Curriculum	Improve reading and writing skills.	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Doing well in class.	\N	2026-05-07 16:22:32.873775+06	2026-05-07 16:22:32.873775+06
11	EDU-VC-00003	3	Vocational	\N	\N	\N	Computer Training	Ongoing	CDC Training Center	2024-01-23	\N	\N	\N	\N	IT	Basic Certificate	15	\N	\N	\N	\N	\N	\N	\N	\N	Learning basic skills quickly.	\N	2026-05-07 16:22:32.87695+06	2026-05-07 16:22:32.87695+06
12	EDU-SA-00003	3	Skills Assessment	\N	\N	\N	Initial Skills Assessment	Completed	\N	2024-01-23	\N	\N	\N	\N	\N	\N	\N	2024-01-23	সজল কুমার দাস	Basic	Basic	Emerging	Drawing, Sports	Quick learner	Individual attention	\N	Continue current plan.	2026-05-07 16:22:32.880163+06	2026-05-07 16:22:32.880163+06
13	EDU-AF-00004	4	Admission Form	Grade 8	Requires basic literacy and numeracy support.	সজল কুমার দাস	Initial Admission Assessment	Completed	\N	2024-04-02	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:32.942539+06	2026-05-07 16:22:32.942539+06
14	EDU-ED-00004	4	Education	\N	\N	\N	Basic Education	Ongoing	CDC Primary School	2024-04-02	\N	Primary	National Curriculum	Improve reading and writing skills.	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Doing well in class.	\N	2026-05-07 16:22:32.947009+06	2026-05-07 16:22:32.947009+06
15	EDU-VC-00004	4	Vocational	\N	\N	\N	Tailoring Course	Ongoing	CDC Training Center	2024-04-02	\N	\N	\N	\N	Tailoring	Basic Certificate	15	\N	\N	\N	\N	\N	\N	\N	\N	Learning basic skills quickly.	\N	2026-05-07 16:22:32.951815+06	2026-05-07 16:22:32.951815+06
16	EDU-SA-00004	4	Skills Assessment	\N	\N	\N	Initial Skills Assessment	Completed	\N	2024-04-02	\N	\N	\N	\N	\N	\N	\N	2024-04-02	সজল কুমার দাস	Basic	Basic	Emerging	Drawing, Sports	Quick learner	Individual attention	\N	Continue current plan.	2026-05-07 16:22:32.957334+06	2026-05-07 16:22:32.957334+06
17	EDU-AF-00005	5	Admission Form	Grade 9	Requires basic literacy and numeracy support.	সজল কুমার দাস	Initial Admission Assessment	Completed	\N	2024-06-21	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.0231+06	2026-05-07 16:22:33.0231+06
18	EDU-ED-00005	5	Education	\N	\N	\N	Basic Education	Ongoing	CDC Primary School	2024-06-21	\N	Primary	National Curriculum	Improve reading and writing skills.	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Doing well in class.	\N	2026-05-07 16:22:33.027971+06	2026-05-07 16:22:33.027971+06
19	EDU-VC-00005	5	Vocational	\N	\N	\N	Computer Training	Ongoing	CDC Training Center	2024-06-21	\N	\N	\N	\N	IT	Basic Certificate	15	\N	\N	\N	\N	\N	\N	\N	\N	Learning basic skills quickly.	\N	2026-05-07 16:22:33.032297+06	2026-05-07 16:22:33.032297+06
20	EDU-SA-00005	5	Skills Assessment	\N	\N	\N	Initial Skills Assessment	Completed	\N	2024-06-21	\N	\N	\N	\N	\N	\N	\N	2024-06-21	সজল কুমার দাস	Basic	Basic	Emerging	Drawing, Sports	Quick learner	Individual attention	\N	Continue current plan.	2026-05-07 16:22:33.036632+06	2026-05-07 16:22:33.036632+06
21	EDU-AF-00006	6	Admission Form	Grade 8	Requires basic literacy and numeracy support.	সজল কুমার দাস	Initial Admission Assessment	Completed	\N	2024-11-18	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.113836+06	2026-05-07 16:22:33.113836+06
22	EDU-ED-00006	6	Education	\N	\N	\N	Basic Education	Ongoing	CDC Primary School	2024-11-18	\N	Primary	National Curriculum	Improve reading and writing skills.	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Doing well in class.	\N	2026-05-07 16:22:33.118277+06	2026-05-07 16:22:33.118277+06
23	EDU-VC-00006	6	Vocational	\N	\N	\N	Tailoring Course	Ongoing	CDC Training Center	2024-11-18	\N	\N	\N	\N	Tailoring	Basic Certificate	15	\N	\N	\N	\N	\N	\N	\N	\N	Learning basic skills quickly.	\N	2026-05-07 16:22:33.12392+06	2026-05-07 16:22:33.12392+06
24	EDU-SA-00006	6	Skills Assessment	\N	\N	\N	Initial Skills Assessment	Completed	\N	2024-11-18	\N	\N	\N	\N	\N	\N	\N	2024-11-18	সজল কুমার দাস	Basic	Basic	Emerging	Drawing, Sports	Quick learner	Individual attention	\N	Continue current plan.	2026-05-07 16:22:33.128819+06	2026-05-07 16:22:33.128819+06
25	EDU-AF-00007	7	Admission Form	Grade 9	Requires basic literacy and numeracy support.	সজল কুমার দাস	Initial Admission Assessment	Completed	\N	2023-07-07	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.27318+06	2026-05-07 16:22:33.27318+06
26	EDU-ED-00007	7	Education	\N	\N	\N	Basic Education	Ongoing	CDC Primary School	2023-07-07	\N	Primary	National Curriculum	Improve reading and writing skills.	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Doing well in class.	\N	2026-05-07 16:22:33.276023+06	2026-05-07 16:22:33.276023+06
27	EDU-VC-00007	7	Vocational	\N	\N	\N	Computer Training	Ongoing	CDC Training Center	2023-07-07	\N	\N	\N	\N	IT	Basic Certificate	15	\N	\N	\N	\N	\N	\N	\N	\N	Learning basic skills quickly.	\N	2026-05-07 16:22:33.281668+06	2026-05-07 16:22:33.281668+06
28	EDU-SA-00007	7	Skills Assessment	\N	\N	\N	Initial Skills Assessment	Completed	\N	2023-07-07	\N	\N	\N	\N	\N	\N	\N	2023-07-07	সজল কুমার দাস	Basic	Basic	Emerging	Drawing, Sports	Quick learner	Individual attention	\N	Continue current plan.	2026-05-07 16:22:33.289366+06	2026-05-07 16:22:33.289366+06
29	EDU-AF-00008	8	Admission Form	Grade 8	Requires basic literacy and numeracy support.	সজল কুমার দাস	Initial Admission Assessment	Completed	\N	2023-03-29	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.379041+06	2026-05-07 16:22:33.379041+06
30	EDU-ED-00008	8	Education	\N	\N	\N	Basic Education	Ongoing	CDC Primary School	2023-03-29	\N	Primary	National Curriculum	Improve reading and writing skills.	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Doing well in class.	\N	2026-05-07 16:22:33.381918+06	2026-05-07 16:22:33.381918+06
31	EDU-VC-00008	8	Vocational	\N	\N	\N	Tailoring Course	Ongoing	CDC Training Center	2023-03-29	\N	\N	\N	\N	Tailoring	Basic Certificate	15	\N	\N	\N	\N	\N	\N	\N	\N	Learning basic skills quickly.	\N	2026-05-07 16:22:33.384868+06	2026-05-07 16:22:33.384868+06
32	EDU-SA-00008	8	Skills Assessment	\N	\N	\N	Initial Skills Assessment	Completed	\N	2023-03-29	\N	\N	\N	\N	\N	\N	\N	2023-03-29	সজল কুমার দাস	Basic	Basic	Emerging	Drawing, Sports	Quick learner	Individual attention	\N	Continue current plan.	2026-05-07 16:22:33.387543+06	2026-05-07 16:22:33.387543+06
33	EDU-AF-00009	9	Admission Form	Grade 9	Requires basic literacy and numeracy support.	সজল কুমার দাস	Initial Admission Assessment	Completed	\N	2023-04-03	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.424892+06	2026-05-07 16:22:33.424892+06
34	EDU-ED-00009	9	Education	\N	\N	\N	Basic Education	Ongoing	CDC Primary School	2023-04-03	\N	Primary	National Curriculum	Improve reading and writing skills.	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Doing well in class.	\N	2026-05-07 16:22:33.427355+06	2026-05-07 16:22:33.427355+06
35	EDU-VC-00009	9	Vocational	\N	\N	\N	Computer Training	Ongoing	CDC Training Center	2023-04-03	\N	\N	\N	\N	IT	Basic Certificate	15	\N	\N	\N	\N	\N	\N	\N	\N	Learning basic skills quickly.	\N	2026-05-07 16:22:33.429972+06	2026-05-07 16:22:33.429972+06
36	EDU-SA-00009	9	Skills Assessment	\N	\N	\N	Initial Skills Assessment	Completed	\N	2023-04-03	\N	\N	\N	\N	\N	\N	\N	2023-04-03	সজল কুমার দাস	Basic	Basic	Emerging	Drawing, Sports	Quick learner	Individual attention	\N	Continue current plan.	2026-05-07 16:22:33.432899+06	2026-05-07 16:22:33.432899+06
37	EDU-AF-00010	10	Admission Form	Grade 8	Requires basic literacy and numeracy support.	সজল কুমার দাস	Initial Admission Assessment	Completed	\N	2024-11-18	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.467595+06	2026-05-07 16:22:33.467595+06
38	EDU-ED-00010	10	Education	\N	\N	\N	Basic Education	Ongoing	CDC Primary School	2024-11-18	\N	Primary	National Curriculum	Improve reading and writing skills.	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Doing well in class.	\N	2026-05-07 16:22:33.470316+06	2026-05-07 16:22:33.470316+06
39	EDU-VC-00010	10	Vocational	\N	\N	\N	Tailoring Course	Ongoing	CDC Training Center	2024-11-18	\N	\N	\N	\N	Tailoring	Basic Certificate	15	\N	\N	\N	\N	\N	\N	\N	\N	Learning basic skills quickly.	\N	2026-05-07 16:22:33.472867+06	2026-05-07 16:22:33.472867+06
40	EDU-SA-00010	10	Skills Assessment	\N	\N	\N	Initial Skills Assessment	Completed	\N	2024-11-18	\N	\N	\N	\N	\N	\N	\N	2024-11-18	সজল কুমার দাস	Basic	Basic	Emerging	Drawing, Sports	Quick learner	Individual attention	\N	Continue current plan.	2026-05-07 16:22:33.47541+06	2026-05-07 16:22:33.47541+06
41	EDU-AF-00026	11	Admission Form	Grade 8	Requires basic literacy and numeracy support.	মিসেস শিরিন আক্তার	Initial Admission Assessment	Completed	\N	2024-04-02	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.55323+06	2026-05-07 16:22:33.55323+06
42	EDU-ED-00026	11	Education	\N	\N	\N	Basic Education	Ongoing	CDC Primary School	2024-04-02	\N	Primary	National Curriculum	Improve reading and writing skills.	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Doing well in class.	\N	2026-05-07 16:22:33.555857+06	2026-05-07 16:22:33.555857+06
43	EDU-VC-00026	11	Vocational	\N	\N	\N	Tailoring Course	Ongoing	CDC Training Center	2024-04-02	\N	\N	\N	\N	Tailoring	Basic Certificate	15	\N	\N	\N	\N	\N	\N	\N	\N	Learning basic skills quickly.	\N	2026-05-07 16:22:33.558377+06	2026-05-07 16:22:33.558377+06
44	EDU-SA-00026	11	Skills Assessment	\N	\N	\N	Initial Skills Assessment	Completed	\N	2024-04-02	\N	\N	\N	\N	\N	\N	\N	2024-04-02	মিসেস শিরিন আক্তার	Basic	Basic	Emerging	Drawing, Sports	Quick learner	Individual attention	\N	Continue current plan.	2026-05-07 16:22:33.561026+06	2026-05-07 16:22:33.561026+06
45	EDU-AF-00027	12	Admission Form	Grade 9	Requires basic literacy and numeracy support.	মিসেস শিরিন আক্তার	Initial Admission Assessment	Completed	\N	2024-08-10	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.598074+06	2026-05-07 16:22:33.598074+06
46	EDU-ED-00027	12	Education	\N	\N	\N	Basic Education	Ongoing	CDC Primary School	2024-08-10	\N	Primary	National Curriculum	Improve reading and writing skills.	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Doing well in class.	\N	2026-05-07 16:22:33.601025+06	2026-05-07 16:22:33.601025+06
47	EDU-VC-00027	12	Vocational	\N	\N	\N	Computer Training	Ongoing	CDC Training Center	2024-08-10	\N	\N	\N	\N	IT	Basic Certificate	15	\N	\N	\N	\N	\N	\N	\N	\N	Learning basic skills quickly.	\N	2026-05-07 16:22:33.603679+06	2026-05-07 16:22:33.603679+06
48	EDU-SA-00027	12	Skills Assessment	\N	\N	\N	Initial Skills Assessment	Completed	\N	2024-08-10	\N	\N	\N	\N	\N	\N	\N	2024-08-10	মিসেস শিরিন আক্তার	Basic	Basic	Emerging	Drawing, Sports	Quick learner	Individual attention	\N	Continue current plan.	2026-05-07 16:22:33.60648+06	2026-05-07 16:22:33.60648+06
49	EDU-AF-00028	13	Admission Form	Grade 8	Requires basic literacy and numeracy support.	মিসেস শিরিন আক্তার	Initial Admission Assessment	Completed	\N	2024-04-02	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.657408+06	2026-05-07 16:22:33.657408+06
50	EDU-ED-00028	13	Education	\N	\N	\N	Basic Education	Ongoing	CDC Primary School	2024-04-02	\N	Primary	National Curriculum	Improve reading and writing skills.	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Doing well in class.	\N	2026-05-07 16:22:33.661252+06	2026-05-07 16:22:33.661252+06
51	EDU-VC-00028	13	Vocational	\N	\N	\N	Tailoring Course	Ongoing	CDC Training Center	2024-04-02	\N	\N	\N	\N	Tailoring	Basic Certificate	15	\N	\N	\N	\N	\N	\N	\N	\N	Learning basic skills quickly.	\N	2026-05-07 16:22:33.66552+06	2026-05-07 16:22:33.66552+06
52	EDU-SA-00028	13	Skills Assessment	\N	\N	\N	Initial Skills Assessment	Completed	\N	2024-04-02	\N	\N	\N	\N	\N	\N	\N	2024-04-02	মিসেস শিরিন আক্তার	Basic	Basic	Emerging	Drawing, Sports	Quick learner	Individual attention	\N	Continue current plan.	2026-05-07 16:22:33.670009+06	2026-05-07 16:22:33.670009+06
53	EDU-AF-00029	14	Admission Form	Grade 9	Requires basic literacy and numeracy support.	মিসেস শিরিন আক্তার	Initial Admission Assessment	Completed	\N	2024-01-23	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.72756+06	2026-05-07 16:22:33.72756+06
54	EDU-ED-00029	14	Education	\N	\N	\N	Basic Education	Ongoing	CDC Primary School	2024-01-23	\N	Primary	National Curriculum	Improve reading and writing skills.	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Doing well in class.	\N	2026-05-07 16:22:33.731941+06	2026-05-07 16:22:33.731941+06
55	EDU-VC-00029	14	Vocational	\N	\N	\N	Computer Training	Ongoing	CDC Training Center	2024-01-23	\N	\N	\N	\N	IT	Basic Certificate	15	\N	\N	\N	\N	\N	\N	\N	\N	Learning basic skills quickly.	\N	2026-05-07 16:22:33.736616+06	2026-05-07 16:22:33.736616+06
56	EDU-SA-00029	14	Skills Assessment	\N	\N	\N	Initial Skills Assessment	Completed	\N	2024-01-23	\N	\N	\N	\N	\N	\N	\N	2024-01-23	মিসেস শিরিন আক্তার	Basic	Basic	Emerging	Drawing, Sports	Quick learner	Individual attention	\N	Continue current plan.	2026-05-07 16:22:33.740656+06	2026-05-07 16:22:33.740656+06
57	EDU-AF-00030	15	Admission Form	Grade 8	Requires basic literacy and numeracy support.	মিসেস শিরিন আক্তার	Initial Admission Assessment	Completed	\N	2024-03-13	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.804555+06	2026-05-07 16:22:33.804555+06
58	EDU-ED-00030	15	Education	\N	\N	\N	Basic Education	Ongoing	CDC Primary School	2024-03-13	\N	Primary	National Curriculum	Improve reading and writing skills.	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Doing well in class.	\N	2026-05-07 16:22:33.808676+06	2026-05-07 16:22:33.808676+06
59	EDU-VC-00030	15	Vocational	\N	\N	\N	Tailoring Course	Ongoing	CDC Training Center	2024-03-13	\N	\N	\N	\N	Tailoring	Basic Certificate	15	\N	\N	\N	\N	\N	\N	\N	\N	Learning basic skills quickly.	\N	2026-05-07 16:22:33.812833+06	2026-05-07 16:22:33.812833+06
60	EDU-SA-00030	15	Skills Assessment	\N	\N	\N	Initial Skills Assessment	Completed	\N	2024-03-13	\N	\N	\N	\N	\N	\N	\N	2024-03-13	মিসেস শিরিন আক্তার	Basic	Basic	Emerging	Drawing, Sports	Quick learner	Individual attention	\N	Continue current plan.	2026-05-07 16:22:33.81696+06	2026-05-07 16:22:33.81696+06
61	EDU-AF-00031	16	Admission Form	Grade 9	Requires basic literacy and numeracy support.	মিসেস শিরিন আক্তার	Initial Admission Assessment	Completed	\N	2023-03-29	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.896036+06	2026-05-07 16:22:33.896036+06
62	EDU-ED-00031	16	Education	\N	\N	\N	Basic Education	Ongoing	CDC Primary School	2023-03-29	\N	Primary	National Curriculum	Improve reading and writing skills.	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Doing well in class.	\N	2026-05-07 16:22:33.900563+06	2026-05-07 16:22:33.900563+06
63	EDU-VC-00031	16	Vocational	\N	\N	\N	Computer Training	Ongoing	CDC Training Center	2023-03-29	\N	\N	\N	\N	IT	Basic Certificate	15	\N	\N	\N	\N	\N	\N	\N	\N	Learning basic skills quickly.	\N	2026-05-07 16:22:33.905131+06	2026-05-07 16:22:33.905131+06
64	EDU-SA-00031	16	Skills Assessment	\N	\N	\N	Initial Skills Assessment	Completed	\N	2023-03-29	\N	\N	\N	\N	\N	\N	\N	2023-03-29	মিসেস শিরিন আক্তার	Basic	Basic	Emerging	Drawing, Sports	Quick learner	Individual attention	\N	Continue current plan.	2026-05-07 16:22:33.910628+06	2026-05-07 16:22:33.910628+06
65	EDU-AF-00032	17	Admission Form	Grade 8	Requires basic literacy and numeracy support.	মিসেস শিরিন আক্তার	Initial Admission Assessment	Completed	\N	2023-04-03	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.981799+06	2026-05-07 16:22:33.981799+06
66	EDU-ED-00032	17	Education	\N	\N	\N	Basic Education	Ongoing	CDC Primary School	2023-04-03	\N	Primary	National Curriculum	Improve reading and writing skills.	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Doing well in class.	\N	2026-05-07 16:22:33.986221+06	2026-05-07 16:22:33.986221+06
67	EDU-VC-00032	17	Vocational	\N	\N	\N	Tailoring Course	Ongoing	CDC Training Center	2023-04-03	\N	\N	\N	\N	Tailoring	Basic Certificate	15	\N	\N	\N	\N	\N	\N	\N	\N	Learning basic skills quickly.	\N	2026-05-07 16:22:33.99037+06	2026-05-07 16:22:33.99037+06
68	EDU-SA-00032	17	Skills Assessment	\N	\N	\N	Initial Skills Assessment	Completed	\N	2023-04-03	\N	\N	\N	\N	\N	\N	\N	2023-04-03	মিসেস শিরিন আক্তার	Basic	Basic	Emerging	Drawing, Sports	Quick learner	Individual attention	\N	Continue current plan.	2026-05-07 16:22:33.994333+06	2026-05-07 16:22:33.994333+06
69	EDU-AF-00033	18	Admission Form	Grade 9	Requires basic literacy and numeracy support.	মিসেস শিরিন আক্তার	Initial Admission Assessment	Completed	\N	2024-08-10	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.056888+06	2026-05-07 16:22:34.056888+06
70	EDU-ED-00033	18	Education	\N	\N	\N	Basic Education	Ongoing	CDC Primary School	2024-08-10	\N	Primary	National Curriculum	Improve reading and writing skills.	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Doing well in class.	\N	2026-05-07 16:22:34.060971+06	2026-05-07 16:22:34.060971+06
71	EDU-VC-00033	18	Vocational	\N	\N	\N	Computer Training	Ongoing	CDC Training Center	2024-08-10	\N	\N	\N	\N	IT	Basic Certificate	15	\N	\N	\N	\N	\N	\N	\N	\N	Learning basic skills quickly.	\N	2026-05-07 16:22:34.065173+06	2026-05-07 16:22:34.065173+06
72	EDU-SA-00033	18	Skills Assessment	\N	\N	\N	Initial Skills Assessment	Completed	\N	2024-08-10	\N	\N	\N	\N	\N	\N	\N	2024-08-10	মিসেস শিরিন আক্তার	Basic	Basic	Emerging	Drawing, Sports	Quick learner	Individual attention	\N	Continue current plan.	2026-05-07 16:22:34.070127+06	2026-05-07 16:22:34.070127+06
73	EDU-AF-00049	19	Admission Form	Grade 9	Requires basic literacy and numeracy support.	মোহাম্মদ বশির আহমেদ	Initial Admission Assessment	Completed	\N	2024-04-02	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.197364+06	2026-05-07 16:22:34.197364+06
74	EDU-ED-00049	19	Education	\N	\N	\N	Basic Education	Ongoing	CDC Primary School	2024-04-02	\N	Primary	National Curriculum	Improve reading and writing skills.	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Doing well in class.	\N	2026-05-07 16:22:34.201602+06	2026-05-07 16:22:34.201602+06
75	EDU-VC-00049	19	Vocational	\N	\N	\N	Computer Training	Ongoing	CDC Training Center	2024-04-02	\N	\N	\N	\N	IT	Basic Certificate	15	\N	\N	\N	\N	\N	\N	\N	\N	Learning basic skills quickly.	\N	2026-05-07 16:22:34.205823+06	2026-05-07 16:22:34.205823+06
76	EDU-SA-00049	19	Skills Assessment	\N	\N	\N	Initial Skills Assessment	Completed	\N	2024-04-02	\N	\N	\N	\N	\N	\N	\N	2024-04-02	মোহাম্মদ বশির আহমেদ	Basic	Basic	Emerging	Drawing, Sports	Quick learner	Individual attention	\N	Continue current plan.	2026-05-07 16:22:34.209825+06	2026-05-07 16:22:34.209825+06
77	EDU-AF-00050	20	Admission Form	Grade 8	Requires basic literacy and numeracy support.	মোহাম্মদ বশির আহমেদ	Initial Admission Assessment	Completed	\N	2024-06-21	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.274312+06	2026-05-07 16:22:34.274312+06
78	EDU-ED-00050	20	Education	\N	\N	\N	Basic Education	Ongoing	CDC Primary School	2024-06-21	\N	Primary	National Curriculum	Improve reading and writing skills.	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Doing well in class.	\N	2026-05-07 16:22:34.278385+06	2026-05-07 16:22:34.278385+06
79	EDU-VC-00050	20	Vocational	\N	\N	\N	Tailoring Course	Ongoing	CDC Training Center	2024-06-21	\N	\N	\N	\N	Tailoring	Basic Certificate	15	\N	\N	\N	\N	\N	\N	\N	\N	Learning basic skills quickly.	\N	2026-05-07 16:22:34.282671+06	2026-05-07 16:22:34.282671+06
80	EDU-SA-00050	20	Skills Assessment	\N	\N	\N	Initial Skills Assessment	Completed	\N	2024-06-21	\N	\N	\N	\N	\N	\N	\N	2024-06-21	মোহাম্মদ বশির আহমেদ	Basic	Basic	Emerging	Drawing, Sports	Quick learner	Individual attention	\N	Continue current plan.	2026-05-07 16:22:34.28711+06	2026-05-07 16:22:34.28711+06
81	EDU-AF-00051	21	Admission Form	Grade 9	Requires basic literacy and numeracy support.	মোহাম্মদ বশির আহমেদ	Initial Admission Assessment	Completed	\N	2024-01-23	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.34419+06	2026-05-07 16:22:34.34419+06
82	EDU-ED-00051	21	Education	\N	\N	\N	Basic Education	Ongoing	CDC Primary School	2024-01-23	\N	Primary	National Curriculum	Improve reading and writing skills.	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Doing well in class.	\N	2026-05-07 16:22:34.349511+06	2026-05-07 16:22:34.349511+06
83	EDU-VC-00051	21	Vocational	\N	\N	\N	Computer Training	Ongoing	CDC Training Center	2024-01-23	\N	\N	\N	\N	IT	Basic Certificate	15	\N	\N	\N	\N	\N	\N	\N	\N	Learning basic skills quickly.	\N	2026-05-07 16:22:34.354469+06	2026-05-07 16:22:34.354469+06
84	EDU-SA-00051	21	Skills Assessment	\N	\N	\N	Initial Skills Assessment	Completed	\N	2024-01-23	\N	\N	\N	\N	\N	\N	\N	2024-01-23	মোহাম্মদ বশির আহমেদ	Basic	Basic	Emerging	Drawing, Sports	Quick learner	Individual attention	\N	Continue current plan.	2026-05-07 16:22:34.358797+06	2026-05-07 16:22:34.358797+06
85	EDU-AF-00052	22	Admission Form	Grade 8	Requires basic literacy and numeracy support.	মোহাম্মদ বশির আহমেদ	Initial Admission Assessment	Completed	\N	2024-03-13	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.435987+06	2026-05-07 16:22:34.435987+06
86	EDU-ED-00052	22	Education	\N	\N	\N	Basic Education	Ongoing	CDC Primary School	2024-03-13	\N	Primary	National Curriculum	Improve reading and writing skills.	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Doing well in class.	\N	2026-05-07 16:22:34.440355+06	2026-05-07 16:22:34.440355+06
87	EDU-VC-00052	22	Vocational	\N	\N	\N	Tailoring Course	Ongoing	CDC Training Center	2024-03-13	\N	\N	\N	\N	Tailoring	Basic Certificate	15	\N	\N	\N	\N	\N	\N	\N	\N	Learning basic skills quickly.	\N	2026-05-07 16:22:34.444309+06	2026-05-07 16:22:34.444309+06
88	EDU-SA-00052	22	Skills Assessment	\N	\N	\N	Initial Skills Assessment	Completed	\N	2024-03-13	\N	\N	\N	\N	\N	\N	\N	2024-03-13	মোহাম্মদ বশির আহমেদ	Basic	Basic	Emerging	Drawing, Sports	Quick learner	Individual attention	\N	Continue current plan.	2026-05-07 16:22:34.44924+06	2026-05-07 16:22:34.44924+06
89	EDU-AF-00053	23	Admission Form	Grade 9	Requires basic literacy and numeracy support.	মোহাম্মদ বশির আহমেদ	Initial Admission Assessment	Completed	\N	2023-04-03	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.516111+06	2026-05-07 16:22:34.516111+06
90	EDU-ED-00053	23	Education	\N	\N	\N	Basic Education	Ongoing	CDC Primary School	2023-04-03	\N	Primary	National Curriculum	Improve reading and writing skills.	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Doing well in class.	\N	2026-05-07 16:22:34.52142+06	2026-05-07 16:22:34.52142+06
91	EDU-VC-00053	23	Vocational	\N	\N	\N	Computer Training	Ongoing	CDC Training Center	2023-04-03	\N	\N	\N	\N	IT	Basic Certificate	15	\N	\N	\N	\N	\N	\N	\N	\N	Learning basic skills quickly.	\N	2026-05-07 16:22:34.526338+06	2026-05-07 16:22:34.526338+06
92	EDU-SA-00053	23	Skills Assessment	\N	\N	\N	Initial Skills Assessment	Completed	\N	2023-04-03	\N	\N	\N	\N	\N	\N	\N	2023-04-03	মোহাম্মদ বশির আহমেদ	Basic	Basic	Emerging	Drawing, Sports	Quick learner	Individual attention	\N	Continue current plan.	2026-05-07 16:22:34.531116+06	2026-05-07 16:22:34.531116+06
93	EDU-AF-00054	24	Admission Form	Grade 8	Requires basic literacy and numeracy support.	মোহাম্মদ বশির আহমেদ	Initial Admission Assessment	Completed	\N	2022-04-03	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.600347+06	2026-05-07 16:22:34.600347+06
94	EDU-ED-00054	24	Education	\N	\N	\N	Basic Education	Ongoing	CDC Primary School	2022-04-03	\N	Primary	National Curriculum	Improve reading and writing skills.	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Doing well in class.	\N	2026-05-07 16:22:34.60473+06	2026-05-07 16:22:34.60473+06
95	EDU-VC-00054	24	Vocational	\N	\N	\N	Tailoring Course	Ongoing	CDC Training Center	2022-04-03	\N	\N	\N	\N	Tailoring	Basic Certificate	15	\N	\N	\N	\N	\N	\N	\N	\N	Learning basic skills quickly.	\N	2026-05-07 16:22:34.60984+06	2026-05-07 16:22:34.60984+06
96	EDU-SA-00054	24	Skills Assessment	\N	\N	\N	Initial Skills Assessment	Completed	\N	2022-04-03	\N	\N	\N	\N	\N	\N	\N	2022-04-03	মোহাম্মদ বশির আহমেদ	Basic	Basic	Emerging	Drawing, Sports	Quick learner	Individual attention	\N	Continue current plan.	2026-05-07 16:22:34.614843+06	2026-05-07 16:22:34.614843+06
97	EDU-AF-00055	25	Admission Form	Grade 9	Requires basic literacy and numeracy support.	মোহাম্মদ বশির আহমেদ	Initial Admission Assessment	Completed	\N	2024-08-10	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.674238+06	2026-05-07 16:22:34.674238+06
98	EDU-ED-00055	25	Education	\N	\N	\N	Basic Education	Ongoing	CDC Primary School	2024-08-10	\N	Primary	National Curriculum	Improve reading and writing skills.	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Doing well in class.	\N	2026-05-07 16:22:34.678662+06	2026-05-07 16:22:34.678662+06
99	EDU-VC-00055	25	Vocational	\N	\N	\N	Computer Training	Ongoing	CDC Training Center	2024-08-10	\N	\N	\N	\N	IT	Basic Certificate	15	\N	\N	\N	\N	\N	\N	\N	\N	Learning basic skills quickly.	\N	2026-05-07 16:22:34.683092+06	2026-05-07 16:22:34.683092+06
100	EDU-SA-00055	25	Skills Assessment	\N	\N	\N	Initial Skills Assessment	Completed	\N	2024-08-10	\N	\N	\N	\N	\N	\N	\N	2024-08-10	মোহাম্মদ বশির আহমেদ	Basic	Basic	Emerging	Drawing, Sports	Quick learner	Individual attention	\N	Continue current plan.	2026-05-07 16:22:34.688089+06	2026-05-07 16:22:34.688089+06
\.


--
-- Data for Name: family_socioeconomic_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.family_socioeconomic_records (id, record_id, child_id, parents_education, parents_occupation, parents_monthly_income, socioeconomic_status, parents_contact_number, child_relationship_with_parents, siblings_count_and_order, is_married, children_count, family_type, parents_marital_status, guardian_type, is_orphan, family_member_substance_abuse, family_criminal_involvement, peer_circle_info, created_at, updated_at) FROM stdin;
1	FS-2026-00001	1	Secondary Education	Day Laborer	10500	Low Income	01711-000001	Good	2 siblings, 2nd child	f	0	Joint	Married	Parents	f	f	f	Plays football with neighborhood kids	2026-05-07 16:22:32.732228+06	2026-05-07 16:22:32.732228+06
2	FS-2026-00002	2	Primary Education	Day Laborer	11000	Low Income	01711-000002	Good	2 siblings, 2nd child	f	0	Nuclear	Married	Parents	f	f	f	Plays football with neighborhood kids	2026-05-07 16:22:32.827813+06	2026-05-07 16:22:32.827813+06
3	FS-2026-00003	3	Secondary Education	Farmer	11500	Low Income	01711-000003	Good	2 siblings, 1st child	f	0	Joint	Married	Parents	f	f	f	Plays football with neighborhood kids	2026-05-07 16:22:32.883825+06	2026-05-07 16:22:32.883825+06
4	FS-2026-00004	4	Primary Education	Day Laborer	12000	Lower Middle Class	01711-000004	Good	2 siblings, 2nd child	f	0	Nuclear	Married	Parents	f	f	f	Plays football with neighborhood kids	2026-05-07 16:22:32.961962+06	2026-05-07 16:22:32.961962+06
5	FS-2026-00005	5	Secondary Education	Day Laborer	12500	Low Income	01711-000005	Good	2 siblings, 2nd child	f	0	Joint	Married	Parents	f	f	f	Plays football with neighborhood kids	2026-05-07 16:22:33.041552+06	2026-05-07 16:22:33.041552+06
6	FS-2026-00006	6	Primary Education	Farmer	13000	Low Income	01711-000006	Good	2 siblings, 1st child	f	0	Nuclear	Married	Parents	f	f	f	Plays football with neighborhood kids	2026-05-07 16:22:33.133351+06	2026-05-07 16:22:33.133351+06
7	FS-2026-00007	7	Secondary Education	Day Laborer	13500	Low Income	01711-000007	Good	2 siblings, 2nd child	f	0	Joint	Married	Parents	f	f	f	Plays football with neighborhood kids	2026-05-07 16:22:33.292545+06	2026-05-07 16:22:33.292545+06
8	FS-2026-00008	8	Primary Education	Day Laborer	14000	Lower Middle Class	01711-000008	Good	2 siblings, 2nd child	f	0	Nuclear	Married	Parents	f	f	t	Plays football with neighborhood kids	2026-05-07 16:22:33.390149+06	2026-05-07 16:22:33.390149+06
9	FS-2026-00009	9	Secondary Education	Farmer	14500	Low Income	01711-000009	Good	2 siblings, 1st child	f	0	Joint	Married	Parents	f	f	f	Plays football with neighborhood kids	2026-05-07 16:22:33.435774+06	2026-05-07 16:22:33.435774+06
10	FS-2026-00010	10	Primary Education	Day Laborer	15000	Low Income	01711-000010	Good	2 siblings, 2nd child	f	0	Nuclear	Married	Parents	f	t	f	Plays football with neighborhood kids	2026-05-07 16:22:33.478102+06	2026-05-07 16:22:33.478102+06
11	FS-2026-00026	11	Primary Education	Day Laborer	23000	Low Income	01711-000026	Good	2 siblings, 2nd child	f	0	Nuclear	Married	Parents	f	f	f	Plays football with neighborhood kids	2026-05-07 16:22:33.563621+06	2026-05-07 16:22:33.563621+06
12	FS-2026-00027	12	Secondary Education	Farmer	23500	Low Income	01711-000027	Good	2 siblings, 1st child	f	0	Joint	Married	Parents	f	f	f	Plays football with neighborhood kids	2026-05-07 16:22:33.609361+06	2026-05-07 16:22:33.609361+06
13	FS-2026-00028	13	Primary Education	Day Laborer	24000	Lower Middle Class	01711-000028	Good	2 siblings, 2nd child	f	0	Nuclear	Married	Parents	f	f	f	Plays football with neighborhood kids	2026-05-07 16:22:33.674039+06	2026-05-07 16:22:33.674039+06
14	FS-2026-00029	14	Secondary Education	Day Laborer	24500	Low Income	01711-000029	Good	2 siblings, 2nd child	f	0	Joint	Married	Parents	f	f	f	Plays football with neighborhood kids	2026-05-07 16:22:33.744373+06	2026-05-07 16:22:33.744373+06
15	FS-2026-00030	15	Primary Education	Farmer	25000	Low Income	01711-000030	Good	2 siblings, 1st child	f	0	Nuclear	Married	Parents	f	t	f	Plays football with neighborhood kids	2026-05-07 16:22:33.820909+06	2026-05-07 16:22:33.820909+06
16	FS-2026-00031	16	Secondary Education	Day Laborer	25500	Low Income	01711-000031	Good	2 siblings, 2nd child	f	0	Joint	Married	Parents	f	f	f	Plays football with neighborhood kids	2026-05-07 16:22:33.915806+06	2026-05-07 16:22:33.915806+06
17	FS-2026-00032	17	Primary Education	Day Laborer	26000	Lower Middle Class	01711-000032	Good	2 siblings, 2nd child	f	0	Nuclear	Married	Parents	f	f	t	Plays football with neighborhood kids	2026-05-07 16:22:33.998947+06	2026-05-07 16:22:33.998947+06
18	FS-2026-00033	18	Secondary Education	Farmer	26500	Low Income	01711-000033	Good	2 siblings, 1st child	f	0	Joint	Married	Parents	f	f	f	Plays football with neighborhood kids	2026-05-07 16:22:34.074673+06	2026-05-07 16:22:34.074673+06
19	FS-2026-00049	19	Secondary Education	Day Laborer	34500	Low Income	01711-000049	Good	2 siblings, 2nd child	f	0	Joint	Married	Parents	f	f	f	Plays football with neighborhood kids	2026-05-07 16:22:34.214294+06	2026-05-07 16:22:34.214294+06
20	FS-2026-00050	20	Primary Education	Day Laborer	35000	Low Income	01711-000050	Good	2 siblings, 2nd child	f	0	Nuclear	Married	Parents	f	t	f	Plays football with neighborhood kids	2026-05-07 16:22:34.291142+06	2026-05-07 16:22:34.291142+06
21	FS-2026-00051	21	Secondary Education	Farmer	35500	Low Income	01711-000051	Good	2 siblings, 1st child	f	0	Joint	Married	Parents	f	f	f	Plays football with neighborhood kids	2026-05-07 16:22:34.363036+06	2026-05-07 16:22:34.363036+06
22	FS-2026-00052	22	Primary Education	Day Laborer	36000	Lower Middle Class	01711-000052	Good	2 siblings, 2nd child	f	0	Nuclear	Married	Parents	f	f	f	Plays football with neighborhood kids	2026-05-07 16:22:34.453878+06	2026-05-07 16:22:34.453878+06
23	FS-2026-00053	23	Secondary Education	Day Laborer	36500	Low Income	01711-000053	Good	2 siblings, 2nd child	f	0	Joint	Married	Parents	f	f	f	Plays football with neighborhood kids	2026-05-07 16:22:34.535941+06	2026-05-07 16:22:34.535941+06
24	FS-2026-00054	24	Primary Education	Farmer	37000	Low Income	01711-000054	Good	2 siblings, 1st child	f	0	Nuclear	Married	Parents	f	f	f	Plays football with neighborhood kids	2026-05-07 16:22:34.619252+06	2026-05-07 16:22:34.619252+06
25	FS-2026-00055	25	Secondary Education	Day Laborer	37500	Low Income	01711-000055	Good	2 siblings, 2nd child	f	0	Joint	Married	Parents	f	f	f	Plays football with neighborhood kids	2026-05-07 16:22:34.692205+06	2026-05-07 16:22:34.692205+06
\.


--
-- Data for Name: family_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.family_types (id, name_bn, name_en, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: follow_ups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.follow_ups (id, follow_up_id, child_id, follow_up_date, visit_type, observation, next_action, created_at, updated_at) FROM stdin;
1	FU-2026-00001	1	2026-04-17	Routine	শিশু স্বাভাবিক আচরণ করছে। কেন্দ্রের কার্যক্রমে অংশ নিচ্ছে।	আগামী মাসে পুনরায় ফলো-আপ নিশ্চিত করতে হবে।	2026-05-07 16:22:32.69663+06	2026-05-07 16:22:32.69663+06
2	FU-2026-00002	2	2026-04-17	Routine	শিশু স্বাভাবিক আচরণ করছে। কেন্দ্রের কার্যক্রমে অংশ নিচ্ছে।	আগামী মাসে পুনরায় ফলো-আপ নিশ্চিত করতে হবে।	2026-05-07 16:22:32.796285+06	2026-05-07 16:22:32.796285+06
3	FU-2026-00003	3	2026-04-17	Routine	শিশু স্বাভাবিক আচরণ করছে। কেন্দ্রের কার্যক্রমে অংশ নিচ্ছে।	আগামী মাসে পুনরায় ফলো-আপ নিশ্চিত করতে হবে।	2026-05-07 16:22:32.8646+06	2026-05-07 16:22:32.8646+06
4	FU-2026-00004	4	2026-04-17	Routine	শিশু স্বাভাবিক আচরণ করছে। কেন্দ্রের কার্যক্রমে অংশ নিচ্ছে।	আগামী মাসে পুনরায় ফলো-আপ নিশ্চিত করতে হবে।	2026-05-07 16:22:32.933659+06	2026-05-07 16:22:32.933659+06
5	FU-2026-00005	5	2026-04-17	Routine	শিশু স্বাভাবিক আচরণ করছে। কেন্দ্রের কার্যক্রমে অংশ নিচ্ছে।	আগামী মাসে পুনরায় ফলো-আপ নিশ্চিত করতে হবে।	2026-05-07 16:22:33.017505+06	2026-05-07 16:22:33.017505+06
6	FU-2026-00006	6	2026-04-17	Routine	শিশু স্বাভাবিক আচরণ করছে। কেন্দ্রের কার্যক্রমে অংশ নিচ্ছে।	আগামী মাসে পুনরায় ফলো-আপ নিশ্চিত করতে হবে।	2026-05-07 16:22:33.102668+06	2026-05-07 16:22:33.102668+06
7	FU-2026-00007	7	2026-04-17	Routine	শিশু স্বাভাবিক আচরণ করছে। কেন্দ্রের কার্যক্রমে অংশ নিচ্ছে।	আগামী মাসে পুনরায় ফলো-আপ নিশ্চিত করতে হবে।	2026-05-07 16:22:33.2288+06	2026-05-07 16:22:33.2288+06
8	FU-2026-00008	8	2026-04-17	Routine	শিশু স্বাভাবিক আচরণ করছে। কেন্দ্রের কার্যক্রমে অংশ নিচ্ছে।	আগামী মাসে পুনরায় ফলো-আপ নিশ্চিত করতে হবে।	2026-05-07 16:22:33.376425+06	2026-05-07 16:22:33.376425+06
9	FU-2026-00009	9	2026-04-17	Routine	শিশু স্বাভাবিক আচরণ করছে। কেন্দ্রের কার্যক্রমে অংশ নিচ্ছে।	আগামী মাসে পুনরায় ফলো-আপ নিশ্চিত করতে হবে।	2026-05-07 16:22:33.419942+06	2026-05-07 16:22:33.419942+06
10	FU-2026-00026	11	2026-04-17	Routine	শিশু স্বাভাবিক আচরণ করছে। কেন্দ্রের কার্যক্রমে অংশ নিচ্ছে।	আগামী মাসে পুনরায় ফলো-আপ নিশ্চিত করতে হবে।	2026-05-07 16:22:33.547921+06	2026-05-07 16:22:33.547921+06
11	FU-2026-00027	12	2026-04-17	Routine	শিশু স্বাভাবিক আচরণ করছে। কেন্দ্রের কার্যক্রমে অংশ নিচ্ছে।	আগামী মাসে পুনরায় ফলো-আপ নিশ্চিত করতে হবে।	2026-05-07 16:22:33.592817+06	2026-05-07 16:22:33.592817+06
12	FU-2026-00028	13	2026-04-17	Routine	শিশু স্বাভাবিক আচরণ করছে। কেন্দ্রের কার্যক্রমে অংশ নিচ্ছে।	আগামী মাসে পুনরায় ফলো-আপ নিশ্চিত করতে হবে।	2026-05-07 16:22:33.648926+06	2026-05-07 16:22:33.648926+06
13	FU-2026-00029	14	2026-04-17	Routine	শিশু স্বাভাবিক আচরণ করছে। কেন্দ্রের কার্যক্রমে অংশ নিচ্ছে।	আগামী মাসে পুনরায় ফলো-আপ নিশ্চিত করতে হবে।	2026-05-07 16:22:33.723892+06	2026-05-07 16:22:33.723892+06
14	FU-2026-00030	15	2026-04-17	Routine	শিশু স্বাভাবিক আচরণ করছে। কেন্দ্রের কার্যক্রমে অংশ নিচ্ছে।	আগামী মাসে পুনরায় ফলো-আপ নিশ্চিত করতে হবে।	2026-05-07 16:22:33.795937+06	2026-05-07 16:22:33.795937+06
15	FU-2026-00031	16	2026-04-17	Routine	শিশু স্বাভাবিক আচরণ করছে। কেন্দ্রের কার্যক্রমে অংশ নিচ্ছে।	আগামী মাসে পুনরায় ফলো-আপ নিশ্চিত করতে হবে।	2026-05-07 16:22:33.886813+06	2026-05-07 16:22:33.886813+06
16	FU-2026-00032	17	2026-04-17	Routine	শিশু স্বাভাবিক আচরণ করছে। কেন্দ্রের কার্যক্রমে অংশ নিচ্ছে।	আগামী মাসে পুনরায় ফলো-আপ নিশ্চিত করতে হবে।	2026-05-07 16:22:33.973885+06	2026-05-07 16:22:33.973885+06
17	FU-2026-00049	19	2026-04-17	Routine	শিশু স্বাভাবিক আচরণ করছে। কেন্দ্রের কার্যক্রমে অংশ নিচ্ছে।	আগামী মাসে পুনরায় ফলো-আপ নিশ্চিত করতে হবে।	2026-05-07 16:22:34.188835+06	2026-05-07 16:22:34.188835+06
18	FU-2026-00050	20	2026-04-17	Routine	শিশু স্বাভাবিক আচরণ করছে। কেন্দ্রের কার্যক্রমে অংশ নিচ্ছে।	আগামী মাসে পুনরায় ফলো-আপ নিশ্চিত করতে হবে।	2026-05-07 16:22:34.265245+06	2026-05-07 16:22:34.265245+06
19	FU-2026-00051	21	2026-04-17	Routine	শিশু স্বাভাবিক আচরণ করছে। কেন্দ্রের কার্যক্রমে অংশ নিচ্ছে।	আগামী মাসে পুনরায় ফলো-আপ নিশ্চিত করতে হবে।	2026-05-07 16:22:34.340187+06	2026-05-07 16:22:34.340187+06
20	FU-2026-00052	22	2026-04-17	Routine	শিশু স্বাভাবিক আচরণ করছে। কেন্দ্রের কার্যক্রমে অংশ নিচ্ছে।	আগামী মাসে পুনরায় ফলো-আপ নিশ্চিত করতে হবে।	2026-05-07 16:22:34.427039+06	2026-05-07 16:22:34.427039+06
21	FU-2026-00053	23	2026-04-17	Routine	শিশু স্বাভাবিক আচরণ করছে। কেন্দ্রের কার্যক্রমে অংশ নিচ্ছে।	আগামী মাসে পুনরায় ফলো-আপ নিশ্চিত করতে হবে।	2026-05-07 16:22:34.507655+06	2026-05-07 16:22:34.507655+06
22	FU-2026-00054	24	2026-04-17	Routine	শিশু স্বাভাবিক আচরণ করছে। কেন্দ্রের কার্যক্রমে অংশ নিচ্ছে।	আগামী মাসে পুনরায় ফলো-আপ নিশ্চিত করতে হবে।	2026-05-07 16:22:34.591221+06	2026-05-07 16:22:34.591221+06
\.


--
-- Data for Name: guardian_visits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.guardian_visits (id, visit_id, child_id, guardian_id, visit_date, purpose_of_visit, observations, created_at, updated_at) FROM stdin;
1	VISIT-2026-00012	1	1	2026-01-02	প্রথম সাক্ষাৎ — শিশুর সার্বিক অবস্থা পর্যবেক্ষণ	অভিভাবক শিশুর সাথে দেখা করে সন্তুষ্ট হয়েছেন। কেন্দ্রের পরিবেশ ভালো মনে হয়েছে।	2026-05-07 16:22:33.484064+06	2026-05-07 16:22:33.484064+06
2	VISIT-2026-00013	1	1	2026-02-16	নিয়মিত সাক্ষাৎ ও পরিবারের সাথে মিলনের পরিকল্পনা	শিশু পরিবারের সাথে দেখা করে আনন্দিত। পুনর্মিলনের জন্য আবেদন করা হয়েছে।	2026-05-07 16:22:33.486922+06	2026-05-07 16:22:33.486922+06
3	VISIT-2026-00014	2	1	2026-01-02	প্রথম সাক্ষাৎ — শিশুর সার্বিক অবস্থা পর্যবেক্ষণ	অভিভাবক শিশুর সাথে দেখা করে সন্তুষ্ট হয়েছেন। কেন্দ্রের পরিবেশ ভালো মনে হয়েছে।	2026-05-07 16:22:33.489557+06	2026-05-07 16:22:33.489557+06
4	VISIT-2026-00015	2	1	2026-02-16	নিয়মিত সাক্ষাৎ ও পরিবারের সাথে মিলনের পরিকল্পনা	শিশু পরিবারের সাথে দেখা করে আনন্দিত। পুনর্মিলনের জন্য আবেদন করা হয়েছে।	2026-05-07 16:22:33.492247+06	2026-05-07 16:22:33.492247+06
5	VISIT-2026-00017	3	2	2026-01-02	প্রথম সাক্ষাৎ — শিশুর সার্বিক অবস্থা পর্যবেক্ষণ	অভিভাবক শিশুর সাথে দেখা করে সন্তুষ্ট হয়েছেন। কেন্দ্রের পরিবেশ ভালো মনে হয়েছে।	2026-05-07 16:22:33.497596+06	2026-05-07 16:22:33.497596+06
6	VISIT-2026-00018	3	2	2026-02-16	নিয়মিত সাক্ষাৎ ও পরিবারের সাথে মিলনের পরিকল্পনা	শিশু পরিবারের সাথে দেখা করে আনন্দিত। পুনর্মিলনের জন্য আবেদন করা হয়েছে।	2026-05-07 16:22:33.500376+06	2026-05-07 16:22:33.500376+06
7	VISIT-2026-00019	4	2	2026-01-02	প্রথম সাক্ষাৎ — শিশুর সার্বিক অবস্থা পর্যবেক্ষণ	অভিভাবক শিশুর সাথে দেখা করে সন্তুষ্ট হয়েছেন। কেন্দ্রের পরিবেশ ভালো মনে হয়েছে।	2026-05-07 16:22:33.503018+06	2026-05-07 16:22:33.503018+06
8	VISIT-2026-00020	4	2	2026-02-16	নিয়মিত সাক্ষাৎ ও পরিবারের সাথে মিলনের পরিকল্পনা	শিশু পরিবারের সাথে দেখা করে আনন্দিত। পুনর্মিলনের জন্য আবেদন করা হয়েছে।	2026-05-07 16:22:33.505659+06	2026-05-07 16:22:33.505659+06
9	VISIT-2026-00022	5	3	2026-01-02	প্রথম সাক্ষাৎ — শিশুর সার্বিক অবস্থা পর্যবেক্ষণ	অভিভাবক শিশুর সাথে দেখা করে সন্তুষ্ট হয়েছেন। কেন্দ্রের পরিবেশ ভালো মনে হয়েছে।	2026-05-07 16:22:33.511388+06	2026-05-07 16:22:33.511388+06
10	VISIT-2026-00023	5	3	2026-02-16	নিয়মিত সাক্ষাৎ ও পরিবারের সাথে মিলনের পরিকল্পনা	শিশু পরিবারের সাথে দেখা করে আনন্দিত। পুনর্মিলনের জন্য আবেদন করা হয়েছে।	2026-05-07 16:22:33.514022+06	2026-05-07 16:22:33.514022+06
11	VISIT-2026-00024	6	3	2026-01-02	প্রথম সাক্ষাৎ — শিশুর সার্বিক অবস্থা পর্যবেক্ষণ	অভিভাবক শিশুর সাথে দেখা করে সন্তুষ্ট হয়েছেন। কেন্দ্রের পরিবেশ ভালো মনে হয়েছে।	2026-05-07 16:22:33.516709+06	2026-05-07 16:22:33.516709+06
12	VISIT-2026-00025	6	3	2026-02-16	নিয়মিত সাক্ষাৎ ও পরিবারের সাথে মিলনের পরিকল্পনা	শিশু পরিবারের সাথে দেখা করে আনন্দিত। পুনর্মিলনের জন্য আবেদন করা হয়েছে।	2026-05-07 16:22:33.519124+06	2026-05-07 16:22:33.519124+06
13	VISIT-2026-00035	11	4	2026-01-02	প্রথম সাক্ষাৎ — শিশুর সার্বিক অবস্থা পর্যবেক্ষণ	অভিভাবক শিশুর সাথে দেখা করে সন্তুষ্ট হয়েছেন। কেন্দ্রের পরিবেশ ভালো মনে হয়েছে।	2026-05-07 16:22:34.083967+06	2026-05-07 16:22:34.083967+06
14	VISIT-2026-00036	11	4	2026-02-16	নিয়মিত সাক্ষাৎ ও পরিবারের সাথে মিলনের পরিকল্পনা	শিশু পরিবারের সাথে দেখা করে আনন্দিত। পুনর্মিলনের জন্য আবেদন করা হয়েছে।	2026-05-07 16:22:34.087989+06	2026-05-07 16:22:34.087989+06
15	VISIT-2026-00037	12	4	2026-01-02	প্রথম সাক্ষাৎ — শিশুর সার্বিক অবস্থা পর্যবেক্ষণ	অভিভাবক শিশুর সাথে দেখা করে সন্তুষ্ট হয়েছেন। কেন্দ্রের পরিবেশ ভালো মনে হয়েছে।	2026-05-07 16:22:34.091761+06	2026-05-07 16:22:34.091761+06
16	VISIT-2026-00038	12	4	2026-02-16	নিয়মিত সাক্ষাৎ ও পরিবারের সাথে মিলনের পরিকল্পনা	শিশু পরিবারের সাথে দেখা করে আনন্দিত। পুনর্মিলনের জন্য আবেদন করা হয়েছে।	2026-05-07 16:22:34.095162+06	2026-05-07 16:22:34.095162+06
17	VISIT-2026-00040	13	5	2026-01-02	প্রথম সাক্ষাৎ — শিশুর সার্বিক অবস্থা পর্যবেক্ষণ	অভিভাবক শিশুর সাথে দেখা করে সন্তুষ্ট হয়েছেন। কেন্দ্রের পরিবেশ ভালো মনে হয়েছে।	2026-05-07 16:22:34.103388+06	2026-05-07 16:22:34.103388+06
18	VISIT-2026-00041	13	5	2026-02-16	নিয়মিত সাক্ষাৎ ও পরিবারের সাথে মিলনের পরিকল্পনা	শিশু পরিবারের সাথে দেখা করে আনন্দিত। পুনর্মিলনের জন্য আবেদন করা হয়েছে।	2026-05-07 16:22:34.107097+06	2026-05-07 16:22:34.107097+06
19	VISIT-2026-00042	14	5	2026-01-02	প্রথম সাক্ষাৎ — শিশুর সার্বিক অবস্থা পর্যবেক্ষণ	অভিভাবক শিশুর সাথে দেখা করে সন্তুষ্ট হয়েছেন। কেন্দ্রের পরিবেশ ভালো মনে হয়েছে।	2026-05-07 16:22:34.110671+06	2026-05-07 16:22:34.110671+06
20	VISIT-2026-00043	14	5	2026-02-16	নিয়মিত সাক্ষাৎ ও পরিবারের সাথে মিলনের পরিকল্পনা	শিশু পরিবারের সাথে দেখা করে আনন্দিত। পুনর্মিলনের জন্য আবেদন করা হয়েছে।	2026-05-07 16:22:34.11433+06	2026-05-07 16:22:34.11433+06
21	VISIT-2026-00045	15	6	2026-01-02	প্রথম সাক্ষাৎ — শিশুর সার্বিক অবস্থা পর্যবেক্ষণ	অভিভাবক শিশুর সাথে দেখা করে সন্তুষ্ট হয়েছেন। কেন্দ্রের পরিবেশ ভালো মনে হয়েছে।	2026-05-07 16:22:34.122671+06	2026-05-07 16:22:34.122671+06
22	VISIT-2026-00046	15	6	2026-02-16	নিয়মিত সাক্ষাৎ ও পরিবারের সাথে মিলনের পরিকল্পনা	শিশু পরিবারের সাথে দেখা করে আনন্দিত। পুনর্মিলনের জন্য আবেদন করা হয়েছে।	2026-05-07 16:22:34.126337+06	2026-05-07 16:22:34.126337+06
23	VISIT-2026-00047	16	6	2026-01-02	প্রথম সাক্ষাৎ — শিশুর সার্বিক অবস্থা পর্যবেক্ষণ	অভিভাবক শিশুর সাথে দেখা করে সন্তুষ্ট হয়েছেন। কেন্দ্রের পরিবেশ ভালো মনে হয়েছে।	2026-05-07 16:22:34.130304+06	2026-05-07 16:22:34.130304+06
24	VISIT-2026-00048	16	6	2026-02-16	নিয়মিত সাক্ষাৎ ও পরিবারের সাথে মিলনের পরিকল্পনা	শিশু পরিবারের সাথে দেখা করে আনন্দিত। পুনর্মিলনের জন্য আবেদন করা হয়েছে।	2026-05-07 16:22:34.134846+06	2026-05-07 16:22:34.134846+06
25	VISIT-2026-00057	19	7	2026-01-02	প্রথম সাক্ষাৎ — শিশুর সার্বিক অবস্থা পর্যবেক্ষণ	অভিভাবক শিশুর সাথে দেখা করে সন্তুষ্ট হয়েছেন। কেন্দ্রের পরিবেশ ভালো মনে হয়েছে।	2026-05-07 16:22:34.70041+06	2026-05-07 16:22:34.70041+06
26	VISIT-2026-00058	19	7	2026-02-16	নিয়মিত সাক্ষাৎ ও পরিবারের সাথে মিলনের পরিকল্পনা	শিশু পরিবারের সাথে দেখা করে আনন্দিত। পুনর্মিলনের জন্য আবেদন করা হয়েছে।	2026-05-07 16:22:34.704332+06	2026-05-07 16:22:34.704332+06
27	VISIT-2026-00059	20	7	2026-01-02	প্রথম সাক্ষাৎ — শিশুর সার্বিক অবস্থা পর্যবেক্ষণ	অভিভাবক শিশুর সাথে দেখা করে সন্তুষ্ট হয়েছেন। কেন্দ্রের পরিবেশ ভালো মনে হয়েছে।	2026-05-07 16:22:34.708185+06	2026-05-07 16:22:34.708185+06
28	VISIT-2026-00060	20	7	2026-02-16	নিয়মিত সাক্ষাৎ ও পরিবারের সাথে মিলনের পরিকল্পনা	শিশু পরিবারের সাথে দেখা করে আনন্দিত। পুনর্মিলনের জন্য আবেদন করা হয়েছে।	2026-05-07 16:22:34.71182+06	2026-05-07 16:22:34.71182+06
29	VISIT-2026-00062	21	8	2026-01-02	প্রথম সাক্ষাৎ — শিশুর সার্বিক অবস্থা পর্যবেক্ষণ	অভিভাবক শিশুর সাথে দেখা করে সন্তুষ্ট হয়েছেন। কেন্দ্রের পরিবেশ ভালো মনে হয়েছে।	2026-05-07 16:22:34.720364+06	2026-05-07 16:22:34.720364+06
30	VISIT-2026-00063	21	8	2026-02-16	নিয়মিত সাক্ষাৎ ও পরিবারের সাথে মিলনের পরিকল্পনা	শিশু পরিবারের সাথে দেখা করে আনন্দিত। পুনর্মিলনের জন্য আবেদন করা হয়েছে।	2026-05-07 16:22:34.724429+06	2026-05-07 16:22:34.724429+06
31	VISIT-2026-00064	22	8	2026-01-02	প্রথম সাক্ষাৎ — শিশুর সার্বিক অবস্থা পর্যবেক্ষণ	অভিভাবক শিশুর সাথে দেখা করে সন্তুষ্ট হয়েছেন। কেন্দ্রের পরিবেশ ভালো মনে হয়েছে।	2026-05-07 16:22:34.728501+06	2026-05-07 16:22:34.728501+06
32	VISIT-2026-00065	22	8	2026-02-16	নিয়মিত সাক্ষাৎ ও পরিবারের সাথে মিলনের পরিকল্পনা	শিশু পরিবারের সাথে দেখা করে আনন্দিত। পুনর্মিলনের জন্য আবেদন করা হয়েছে।	2026-05-07 16:22:34.732603+06	2026-05-07 16:22:34.732603+06
33	VISIT-2026-00067	23	9	2026-01-02	প্রথম সাক্ষাৎ — শিশুর সার্বিক অবস্থা পর্যবেক্ষণ	অভিভাবক শিশুর সাথে দেখা করে সন্তুষ্ট হয়েছেন। কেন্দ্রের পরিবেশ ভালো মনে হয়েছে।	2026-05-07 16:22:34.741309+06	2026-05-07 16:22:34.741309+06
34	VISIT-2026-00068	23	9	2026-02-16	নিয়মিত সাক্ষাৎ ও পরিবারের সাথে মিলনের পরিকল্পনা	শিশু পরিবারের সাথে দেখা করে আনন্দিত। পুনর্মিলনের জন্য আবেদন করা হয়েছে।	2026-05-07 16:22:34.745098+06	2026-05-07 16:22:34.745098+06
\.


--
-- Data for Name: guardians; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.guardians (id, child_id, guardian_id, guardian_name, relationship, nid_no, contact_number, address, created_at, updated_at) FROM stdin;
1	\N	GUARD-2026-00011	মোহাম্মদ করিম হাসান	পিতা	19851234567890	01711-123456	টঙ্গি, গাজীপুর	2026-05-07 16:22:33.480966+06	2026-05-07 16:22:33.480966+06
2	\N	GUARD-2026-00016	রফিকুল রহমান	পিতা	19781234567891	01811-234567	কালীগঞ্জ, গাজীপুর	2026-05-07 16:22:33.494895+06	2026-05-07 16:22:33.494895+06
3	\N	GUARD-2026-00021	মাহমুদুল খান	পিতা	19901234567892	01911-345678	ভৈরব, কিশোরগঞ্জ	2026-05-07 16:22:33.508687+06	2026-05-07 16:22:33.508687+06
4	\N	GUARD-2026-00034	আলমগীর হোসেন	পিতা	19801234567893	01611-456789	কোনাবাড়ি, গাজীপুর	2026-05-07 16:22:34.079264+06	2026-05-07 16:22:34.079264+06
5	\N	GUARD-2026-00039	আব্দুল লতিফ	পিতা	19821234567894	01511-567890	নালিতাবাড়ী, শেরপুর	2026-05-07 16:22:34.09917+06	2026-05-07 16:22:34.09917+06
6	\N	GUARD-2026-00044	সিরাজুল ইসলাম	পিতা	19761234567895	01311-678901	ভুরুঙ্গামারী, কুড়িগ্রাম	2026-05-07 16:22:34.118949+06	2026-05-07 16:22:34.118949+06
7	\N	GUARD-2026-00056	আবুল হাসেম	পিতা	19791234567896	01711-789012	ফুলেরহাট, যশোর	2026-05-07 16:22:34.696494+06	2026-05-07 16:22:34.696494+06
8	\N	GUARD-2026-00061	মোহাম্মদ ইউসুফ	পিতা	19831234567897	01811-890123	ডুমুরিয়া, খুলনা	2026-05-07 16:22:34.716099+06	2026-05-07 16:22:34.716099+06
9	\N	GUARD-2026-00066	বাবুল ইসলাম	পিতা	19861234567898	01911-901234	কেশবপুর, যশোর	2026-05-07 16:22:34.737134+06	2026-05-07 16:22:34.737134+06
\.


--
-- Data for Name: health_assessments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.health_assessments (id, assessment_id, child_id, assessment_date, height, weight, bmi, physical_condition, mental_condition, doctor_name, visible_injury, injury_description, chronic_disease, congenital_disease_info, has_hereditary_disease_history, hereditary_disease_details, has_disability, disability, substance_abuse, gbv_survivor, ongoing_medication, immidiate_treatment_required, hospital_referral_needed, recommendation, created_at, updated_at) FROM stdin;
1	HEALTH-2026-00001	1	2024-04-02	141	36	19.5	Normal	Stable and cooperative	ডা. নুরুল ইসলাম	f	\N	\N	\N	f	\N	f	\N	f	f	\N	f	f	Continue routine medical observation and monthly review.	2026-05-07 16:22:32.65784+06	2026-05-07 16:22:32.65784+06
2	HEALTH-2026-00002	2	2024-08-10	142	37	20.5	Normal	Stable and cooperative	ডা. নুরুল ইসলাম	f	\N	\N	\N	f	\N	f	\N	f	f	\N	f	f	Continue routine medical observation and monthly review.	2026-05-07 16:22:32.765514+06	2026-05-07 16:22:32.765514+06
3	HEALTH-2026-00003	3	2024-01-23	143	38	21.5	Normal	Stable and cooperative	ডা. নুরুল ইসলাম	f	\N	\N	\N	f	\N	f	\N	f	f	\N	f	f	Continue routine medical observation and monthly review.	2026-05-07 16:22:32.844517+06	2026-05-07 16:22:32.844517+06
4	HEALTH-2026-00004	4	2024-04-02	144	39	18.5	Weak	Stable and cooperative	ডা. নুরুল ইসলাম	f	\N	\N	\N	f	\N	f	\N	f	f	\N	f	f	Continue routine medical observation and monthly review.	2026-05-07 16:22:32.907781+06	2026-05-07 16:22:32.907781+06
5	HEALTH-2026-00005	5	2024-06-21	145	40	19.5	Normal	Anxious but responsive	ডা. নুরুল ইসলাম	f	\N	\N	\N	f	\N	f	\N	f	f	\N	f	f	Continue routine medical observation and monthly review.	2026-05-07 16:22:32.989665+06	2026-05-07 16:22:32.989665+06
6	HEALTH-2026-00006	6	2024-11-18	146	41	20.5	Critical	Stable and cooperative	ডা. নুরুল ইসলাম	f	\N	\N	\N	f	\N	f	\N	f	f	\N	f	t	Urgent follow-up and hospital referral recommended.	2026-05-07 16:22:33.074625+06	2026-05-07 16:22:33.074625+06
7	HEALTH-2026-00007	7	2023-07-07	147	42	21.5	Normal	Stable and cooperative	ডা. নুরুল ইসলাম	t	বাম হাতে আঁচড়ের দাগ	\N	\N	f	\N	f	\N	f	f	\N	f	f	Continue routine medical observation and monthly review.	2026-05-07 16:22:33.165542+06	2026-05-07 16:22:33.165542+06
8	HEALTH-2026-00008	8	2023-03-29	148	43	18.5	Weak	Stable and cooperative	ডা. নুরুল ইসলাম	f	\N	\N	\N	f	\N	f	\N	f	t	\N	t	f	Continue routine medical observation and monthly review.	2026-05-07 16:22:33.35988+06	2026-05-07 16:22:33.35988+06
9	HEALTH-2026-00009	9	2023-04-03	149	44	19.5	Normal	Stable and cooperative	ডা. নুরুল ইসলাম	f	\N	Asthma	\N	f	\N	f	\N	f	f	Inhaler as prescribed	f	f	Continue routine medical observation and monthly review.	2026-05-07 16:22:33.40419+06	2026-05-07 16:22:33.40419+06
10	HEALTH-2026-00010	10	2024-11-18	150	45	20.5	Normal	Anxious but responsive	ডা. নুরুল ইসলাম	f	\N	\N	\N	t	Family history of diabetes	f	\N	f	f	\N	f	f	Continue routine medical observation and monthly review.	2026-05-07 16:22:33.449017+06	2026-05-07 16:22:33.449017+06
11	HEALTH-2026-00026	11	2024-04-02	166	41	20.5	Normal	Stable and cooperative	ডা. নুরুল ইসলাম	f	\N	\N	\N	f	\N	f	\N	t	f	\N	f	f	Continue routine medical observation and monthly review.	2026-05-07 16:22:33.532629+06	2026-05-07 16:22:33.532629+06
12	HEALTH-2026-00027	12	2024-08-10	167	42	21.5	Normal	Stable and cooperative	ডা. নুরুল ইসলাম	f	\N	Asthma	\N	f	\N	f	\N	f	f	Inhaler as prescribed	f	f	Continue routine medical observation and monthly review.	2026-05-07 16:22:33.577109+06	2026-05-07 16:22:33.577109+06
13	HEALTH-2026-00028	13	2024-04-02	168	43	18.5	Weak	Stable and cooperative	ডা. নুরুল ইসলাম	t	বাম হাতে আঁচড়ের দাগ	\N	\N	f	\N	f	\N	f	f	\N	f	f	Continue routine medical observation and monthly review.	2026-05-07 16:22:33.626777+06	2026-05-07 16:22:33.626777+06
14	HEALTH-2026-00029	14	2024-01-23	169	44	19.5	Normal	Stable and cooperative	ডা. নুরুল ইসলাম	f	\N	\N	\N	f	\N	f	\N	f	f	\N	f	f	Continue routine medical observation and monthly review.	2026-05-07 16:22:33.69896+06	2026-05-07 16:22:33.69896+06
15	HEALTH-2026-00030	15	2024-03-13	140	45	20.5	Critical	Anxious but responsive	ডা. নুরুল ইসলাম	f	\N	\N	\N	t	Family history of diabetes	f	\N	f	f	\N	f	t	Urgent follow-up and hospital referral recommended.	2026-05-07 16:22:33.771784+06	2026-05-07 16:22:33.771784+06
16	HEALTH-2026-00031	16	2023-03-29	141	46	21.5	Normal	Stable and cooperative	ডা. নুরুল ইসলাম	f	\N	\N	\N	f	\N	f	\N	f	f	\N	f	f	Continue routine medical observation and monthly review.	2026-05-07 16:22:33.846066+06	2026-05-07 16:22:33.846066+06
17	HEALTH-2026-00032	17	2023-04-03	142	47	18.5	Weak	Stable and cooperative	ডা. নুরুল ইসলাম	f	\N	\N	\N	f	\N	f	\N	f	t	\N	t	f	Continue routine medical observation and monthly review.	2026-05-07 16:22:33.946182+06	2026-05-07 16:22:33.946182+06
18	HEALTH-2026-00033	18	2024-08-10	143	48	19.5	Normal	Stable and cooperative	ডা. নুরুল ইসলাম	f	\N	\N	Congenital heart murmur under observation	f	\N	f	\N	f	f	\N	f	f	Continue routine medical observation and monthly review.	2026-05-07 16:22:34.030615+06	2026-05-07 16:22:34.030615+06
19	HEALTH-2026-00049	19	2024-04-02	159	44	19.5	Normal	Stable and cooperative	ডা. নুরুল ইসলাম	t	বাম হাতে আঁচড়ের দাগ	\N	\N	f	\N	f	\N	f	f	\N	f	f	Continue routine medical observation and monthly review.	2026-05-07 16:22:34.162872+06	2026-05-07 16:22:34.162872+06
20	HEALTH-2026-00050	20	2024-06-21	160	45	20.5	Normal	Anxious but responsive	ডা. নুরুল ইসলাম	f	\N	\N	\N	t	Family history of diabetes	f	\N	f	f	\N	f	f	Continue routine medical observation and monthly review.	2026-05-07 16:22:34.24116+06	2026-05-07 16:22:34.24116+06
21	HEALTH-2026-00051	21	2024-01-23	161	46	21.5	Normal	Stable and cooperative	ডা. নুরুল ইসলাম	f	\N	\N	\N	f	\N	f	\N	f	f	\N	f	f	Continue routine medical observation and monthly review.	2026-05-07 16:22:34.315017+06	2026-05-07 16:22:34.315017+06
22	HEALTH-2026-00052	22	2024-03-13	162	47	18.5	Weak	Stable and cooperative	ডা. নুরুল ইসলাম	f	\N	\N	\N	f	\N	f	\N	t	f	\N	f	f	Continue routine medical observation and monthly review.	2026-05-07 16:22:34.399175+06	2026-05-07 16:22:34.399175+06
23	HEALTH-2026-00053	23	2023-04-03	163	48	19.5	Normal	Stable and cooperative	ডা. নুরুল ইসলাম	f	\N	\N	\N	f	\N	f	\N	f	f	\N	f	f	Continue routine medical observation and monthly review.	2026-05-07 16:22:34.484208+06	2026-05-07 16:22:34.484208+06
24	HEALTH-2026-00054	24	2022-04-03	164	49	20.5	Critical	Stable and cooperative	ডা. নুরুল ইসলাম	f	\N	Asthma	\N	f	\N	f	\N	f	f	Inhaler as prescribed	f	t	Urgent follow-up and hospital referral recommended.	2026-05-07 16:22:34.563291+06	2026-05-07 16:22:34.563291+06
25	HEALTH-2026-00055	25	2024-08-10	165	50	21.5	Normal	Anxious but responsive	ডা. নুরুল ইসলাম	f	\N	\N	Congenital heart murmur under observation	f	\N	f	\N	f	f	\N	f	f	Continue routine medical observation and monthly review.	2026-05-07 16:22:34.643797+06	2026-05-07 16:22:34.643797+06
\.


--
-- Data for Name: measurement_surveys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.measurement_surveys (id, survey_id, center_id, child_id, enumerator_name, survey_date, age_group, gender, education_level, detention_length, home_district, structured_routine, education_hours, vocational_hours, physical_activity, reading_access, lifeskills_participation, productive_activities, complaint_opportunities, family_contact, safety_perception, physical_punishment, rules_fairness, captain_system, formal_education, vocational_available, trades_available, vocational_satisfaction, self_harm, inmate_conflicts, emotional_wellbeing, hopefulness, legal_rights_informed, legal_guidance, main_challenges, wished_changes, created_at, updated_at) FROM stdin;
1	SURV-2026-00001	2	1	\N	2024-04-02	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:32.690193+06	2026-05-07 16:22:32.690193+06
2	SURV-2026-00002	2	2	\N	2024-08-10	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:32.790898+06	2026-05-07 16:22:32.790898+06
3	SURV-2026-00003	2	3	\N	2024-01-23	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:32.861337+06	2026-05-07 16:22:32.861337+06
4	SURV-2026-00004	2	4	\N	2024-04-02	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:32.92913+06	2026-05-07 16:22:32.92913+06
5	SURV-2026-00005	2	5	\N	2024-06-21	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.012776+06	2026-05-07 16:22:33.012776+06
6	SURV-2026-00006	2	6	\N	2024-11-18	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.098041+06	2026-05-07 16:22:33.098041+06
7	SURV-2026-00007	2	7	\N	2023-07-07	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.198523+06	2026-05-07 16:22:33.198523+06
8	SURV-2026-00008	2	8	\N	2023-03-29	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.374011+06	2026-05-07 16:22:33.374011+06
9	SURV-2026-00009	2	9	\N	2023-04-03	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.417315+06	2026-05-07 16:22:33.417315+06
10	SURV-2026-00010	2	10	\N	2024-11-18	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.461585+06	2026-05-07 16:22:33.461585+06
11	SURV-2026-00026	3	11	\N	2024-04-02	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.545274+06	2026-05-07 16:22:33.545274+06
12	SURV-2026-00027	3	12	\N	2024-08-10	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.590263+06	2026-05-07 16:22:33.590263+06
13	SURV-2026-00028	3	13	\N	2024-04-02	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.64489+06	2026-05-07 16:22:33.64489+06
14	SURV-2026-00029	3	14	\N	2024-01-23	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.719973+06	2026-05-07 16:22:33.719973+06
15	SURV-2026-00030	3	15	\N	2024-03-13	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.791952+06	2026-05-07 16:22:33.791952+06
16	SURV-2026-00031	3	16	\N	2023-03-29	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.87403+06	2026-05-07 16:22:33.87403+06
17	SURV-2026-00032	3	17	\N	2023-04-03	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:33.96936+06	2026-05-07 16:22:33.96936+06
18	SURV-2026-00033	3	18	\N	2024-08-10	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.052385+06	2026-05-07 16:22:34.052385+06
19	SURV-2026-00049	4	19	\N	2024-04-02	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.184331+06	2026-05-07 16:22:34.184331+06
20	SURV-2026-00050	4	20	\N	2024-06-21	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.261154+06	2026-05-07 16:22:34.261154+06
21	SURV-2026-00051	4	21	\N	2024-01-23	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.336055+06	2026-05-07 16:22:34.336055+06
22	SURV-2026-00052	4	22	\N	2024-03-13	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.422213+06	2026-05-07 16:22:34.422213+06
23	SURV-2026-00053	4	23	\N	2023-04-03	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.503995+06	2026-05-07 16:22:34.503995+06
24	SURV-2026-00054	4	24	\N	2022-04-03	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.586574+06	2026-05-07 16:22:34.586574+06
25	SURV-2026-00055	4	25	\N	2024-08-10	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-07 16:22:34.6665+06	2026-05-07 16:22:34.6665+06
\.


--
-- Data for Name: police_acquisitions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.police_acquisitions (id, acquisition_id, child_id, hearing_date, court_name, case_number, police_station, officers_required, escort_departure_time, requisition_date, status, requested_by_id, center_id, police_officer_name, acknowledgement_ref, remarks, reason_for_transfer, receiving_authority, transfer_date, created_at, updated_at) FROM stdin;
1	POLICE-2026-00001	1	2026-04-07	যুগ্ম দায়রা জজ আদালত, গাজীপুর	CR-2026/001	টঙ্গি থানা	2	08:00	2026-03-26	Submitted	\N	2	ইন্সপেক্টর আবদুল মালেক	\N	শুনানির দিন সময়মতো উপস্থিত থাকতে হবে।	\N	\N	\N	2026-05-07 16:22:32.702555+06	2026-05-07 16:22:32.702555+06
2	POLICE-2026-00002	2	2026-04-14	যুগ্ম দায়রা জজ আদালত, নারায়ণগঞ্জ	CR-2026/002	রূপগঞ্জ থানা	2	08:00	2026-03-26	Draft	\N	2	ইন্সপেক্টর আবদুল মালেক	\N	শুনানির দিন সময়মতো উপস্থিত থাকতে হবে।	\N	\N	\N	2026-05-07 16:22:32.80202+06	2026-05-07 16:22:32.80202+06
3	POLICE-2026-00003	3	2026-04-30	যুগ্ম দায়রা জজ আদালত, গাজীপুর	CR-2026/003	কালীগঞ্জ থানা	2	08:00	2026-03-26	Draft	\N	2	ইন্সপেক্টর আবদুল মালেক	\N	শুনানির দিন সময়মতো উপস্থিত থাকতে হবে।	\N	\N	\N	2026-05-07 16:22:32.867763+06	2026-05-07 16:22:32.867763+06
4	POLICE-2026-00004	4	2026-04-24	যুগ্ম দায়রা জজ আদালত, ঢাকা	CR-2026/004	দেমড়া থানা	2	08:00	2026-03-26	Draft	\N	2	ইন্সপেক্টর আবদুল মালেক	\N	শুনানির দিন সময়মতো উপস্থিত থাকতে হবে।	\N	\N	\N	2026-05-07 16:22:32.938179+06	2026-05-07 16:22:32.938179+06
5	POLICE-2026-00006	6	2026-04-09	যুগ্ম দায়রা জজ আদালত, কিশোরগঞ্জ	CR-2026/006	ভৈরব থানা	2	08:00	2026-03-26	Submitted	\N	2	ইন্সপেক্টর আবদুল মালেক	\N	শুনানির দিন সময়মতো উপস্থিত থাকতে হবে।	\N	\N	\N	2026-05-07 16:22:33.107705+06	2026-05-07 16:22:33.107705+06
6	POLICE-2026-00007	7	2026-04-27	যুগ্ম দায়রা জজ আদালত, গাজীপুর	CR-2026/007	টঙ্গি থানা	2	08:00	2026-03-26	Draft	\N	2	ইন্সপেক্টর আবদুল মালেক	\N	শুনানির দিন সময়মতো উপস্থিত থাকতে হবে।	\N	\N	\N	2026-05-07 16:22:33.26013+06	2026-05-07 16:22:33.26013+06
7	POLICE-2026-00009	9	2026-04-05	যুগ্ম দায়রা জজ আদালত, গাজীপুর	CR-2026/009	টঙ্গি থানা	2	08:00	2026-03-26	Submitted	\N	2	ইন্সপেক্টর আবদুল মালেক	\N	শুনানির দিন সময়মতো উপস্থিত থাকতে হবে।	\N	\N	\N	2026-05-07 16:22:33.422406+06	2026-05-07 16:22:33.422406+06
8	POLICE-2026-00026	11	2026-04-06	যুগ্ম দায়রা জজ আদালত, গাজীপুর	CR-2026/026	কোনাবাড়ি থানা	2	08:00	2026-03-26	Submitted	\N	3	ইন্সপেক্টর আবদুল মালেক	\N	শুনানির দিন সময়মতো উপস্থিত থাকতে হবে।	\N	\N	\N	2026-05-07 16:22:33.550659+06	2026-05-07 16:22:33.550659+06
9	POLICE-2026-00027	12	2026-04-20	যুগ্ম দায়রা জজ আদালত, ময়মনসিংহ	CR-2026/027	ত্রিশাল থানা	2	08:00	2026-03-26	Draft	\N	3	ইন্সপেক্টর আবদুল মালেক	\N	শুনানির দিন সময়মতো উপস্থিত থাকতে হবে।	\N	\N	\N	2026-05-07 16:22:33.595376+06	2026-05-07 16:22:33.595376+06
10	POLICE-2026-00028	13	2026-04-12	যুগ্ম দায়রা জজ আদালত, শেরপুর	CR-2026/028	নালিতাবাড়ী থানা	2	08:00	2026-03-26	Draft	\N	3	ইন্সপেক্টর আবদুল মালেক	\N	শুনানির দিন সময়মতো উপস্থিত থাকতে হবে।	\N	\N	\N	2026-05-07 16:22:33.653165+06	2026-05-07 16:22:33.653165+06
11	POLICE-2026-00030	15	2026-04-22	যুগ্ম দায়রা জজ আদালত, গাজীপুর	CR-2026/030	কালিয়াকৈর থানা	2	08:00	2026-03-26	Draft	\N	3	ইন্সপেক্টর আবদুল মালেক	\N	শুনানির দিন সময়মতো উপস্থিত থাকতে হবে।	\N	\N	\N	2026-05-07 16:22:33.800505+06	2026-05-07 16:22:33.800505+06
12	POLICE-2026-00031	16	2026-04-17	যুগ্ম দায়রা জজ আদালত, কুড়িগ্রাম	CR-2026/031	ভুরুঙ্গামারী থানা	2	08:00	2026-03-26	Draft	\N	3	ইন্সপেক্টর আবদুল মালেক	\N	শুনানির দিন সময়মতো উপস্থিত থাকতে হবে।	\N	\N	\N	2026-05-07 16:22:33.891804+06	2026-05-07 16:22:33.891804+06
13	POLICE-2026-00032	17	2026-04-04	যুগ্ম দায়রা জজ আদালত, জামালপুর	CR-2026/032	মেলান্দহ থানা	2	08:00	2026-03-26	Submitted	\N	3	ইন্সপেক্টর আবদুল মালেক	\N	শুনানির দিন সময়মতো উপস্থিত থাকতে হবে।	\N	\N	\N	2026-05-07 16:22:33.977744+06	2026-05-07 16:22:33.977744+06
14	POLICE-2026-00049	19	2026-04-08	যুগ্ম দায়রা জজ আদালত, যশোর	CR-2026/049	ফুলেরহাট থানা	2	08:00	2026-03-26	Submitted	\N	4	ইন্সপেক্টর আবদুল মালেক	\N	শুনানির দিন সময়মতো উপস্থিত থাকতে হবে।	\N	\N	\N	2026-05-07 16:22:34.193331+06	2026-05-07 16:22:34.193331+06
15	POLICE-2026-00050	20	2026-04-16	যুগ্ম দায়রা জজ আদালত, সাতক্ষীরা	CR-2026/050	শ্যামনগর থানা	2	08:00	2026-03-26	Draft	\N	4	ইন্সপেক্টর আবদুল মালেক	\N	শুনানির দিন সময়মতো উপস্থিত থাকতে হবে।	\N	\N	\N	2026-05-07 16:22:34.270329+06	2026-05-07 16:22:34.270329+06
16	POLICE-2026-00052	22	2026-04-26	যুগ্ম দায়রা জজ আদালত, নড়াইল	CR-2026/052	লোহাগড়া থানা	2	08:00	2026-03-26	Draft	\N	4	ইন্সপেক্টর আবদুল মালেক	\N	শুনানির দিন সময়মতো উপস্থিত থাকতে হবে।	\N	\N	\N	2026-05-07 16:22:34.431177+06	2026-05-07 16:22:34.431177+06
17	POLICE-2026-00053	23	2026-04-11	যুগ্ম দায়রা জজ আদালত, যশোর	CR-2026/053	কেশবপুর থানা	2	08:00	2026-03-26	Draft	\N	4	ইন্সপেক্টর আবদুল মালেক	\N	শুনানির দিন সময়মতো উপস্থিত থাকতে হবে।	\N	\N	\N	2026-05-07 16:22:34.511325+06	2026-05-07 16:22:34.511325+06
18	POLICE-2026-00054	24	2026-04-03	যুগ্ম দায়রা জজ আদালত, যশোর	CR-2026/054	বাঘারপাড়া থানা	2	08:00	2026-03-26	Submitted	\N	4	ইন্সপেক্টর আবদুল মালেক	\N	শুনানির দিন সময়মতো উপস্থিত থাকতে হবে।	\N	\N	\N	2026-05-07 16:22:34.595359+06	2026-05-07 16:22:34.595359+06
\.


--
-- Data for Name: release_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.release_records (id, release_id, child_id, release_date, release_type, handed_over_to, authority_approval, remarks, approval_status, submitted_by, approved_by_name, rejection_note, created_at, updated_at, cw_feedback, po_feedback, rejected_by_name) FROM stdin;
1	REL-2026-00010	10	2026-01-02	Family Reunion	\N	false	পরিবারের সাথে পুনর্মিলন সফলভাবে সম্পন্ন হয়েছে।	Draft	\N	\N	\N	2026-05-07 16:22:33.464308+06	2026-05-07 16:22:33.464308+06	\N	\N	\N
2	REL-2026-00055	25	2026-01-02	Family Reunion	\N	false	পরিবারের সাথে পুনর্মিলন সফলভাবে সম্পন্ন হয়েছে।	Draft	\N	\N	\N	2026-05-07 16:22:34.670292+06	2026-05-07 16:22:34.670292+06	\N	\N	\N
\.


--
-- Data for Name: risk_assessments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.risk_assessments (id, risk_id, child_id, assessment_date, assessed_by, previous_occupation, child_nature, communication_skill, communication_with_guardian, education_training_info, child_counseling_status, family_counseling_status, recreation_arrangement, other_rehabilitation_info, abuse_risk, trafficking_risk, reoffending_risk, self_harm_risk, overall_risk_level, immediate_action_required, protection_measures, status, created_at, updated_at) FROM stdin;
1	RISK-2026-00001	1	2024-04-02	সজল কুমার দাস	\N	\N	\N	\N	\N	\N	\N	\N	\N	Medium	Low	Medium	Low	Medium	f	নিয়মিত ফলো-আপ এবং কাউন্সেলিং চালু রাখুন।	Submitted	2026-05-07 16:22:32.672605+06	2026-05-07 16:22:32.672605+06
2	RISK-2026-00002	2	2024-08-10	সজল কুমার দাস	\N	\N	\N	\N	\N	\N	\N	\N	\N	High	Low	Low	Medium	High	t	নিবিড় পর্যবেক্ষণ ও মনোসামাজিক সহায়তা প্রদান করুন।	Submitted	2026-05-07 16:22:32.775415+06	2026-05-07 16:22:32.775415+06
3	RISK-2026-00003	3	2024-01-23	সজল কুমার দাস	\N	\N	\N	\N	\N	\N	\N	\N	\N	High	Low	Low	Medium	High	t	নিবিড় পর্যবেক্ষণ ও মনোসামাজিক সহায়তা প্রদান করুন।	Submitted	2026-05-07 16:22:32.851505+06	2026-05-07 16:22:32.851505+06
4	RISK-2026-00004	4	2024-04-02	সজল কুমার দাস	\N	\N	\N	\N	\N	\N	\N	\N	\N	Low	Low	Low	Low	Low	f	নিয়মিত ফলো-আপ এবং কাউন্সেলিং চালু রাখুন।	Submitted	2026-05-07 16:22:32.91638+06	2026-05-07 16:22:32.91638+06
5	RISK-2026-00005	5	2024-06-21	সজল কুমার দাস	\N	\N	\N	\N	\N	\N	\N	\N	\N	Medium	Low	Medium	Low	Medium	f	নিয়মিত ফলো-আপ এবং কাউন্সেলিং চালু রাখুন।	Submitted	2026-05-07 16:22:32.999912+06	2026-05-07 16:22:32.999912+06
6	RISK-2026-00006	6	2024-11-18	সজল কুমার দাস	\N	\N	\N	\N	\N	\N	\N	\N	\N	Medium	Low	Low	Low	Medium	f	নিয়মিত ফলো-আপ এবং কাউন্সেলিং চালু রাখুন।	Submitted	2026-05-07 16:22:33.085041+06	2026-05-07 16:22:33.085041+06
7	RISK-2026-00007	7	2023-07-07	সজল কুমার দাস	\N	\N	\N	\N	\N	\N	\N	\N	\N	Medium	Low	Medium	Low	Medium	f	নিয়মিত ফলো-আপ এবং কাউন্সেলিং চালু রাখুন।	Submitted	2026-05-07 16:22:33.174978+06	2026-05-07 16:22:33.174978+06
8	RISK-2026-00008	8	2023-03-29	সজল কুমার দাস	\N	\N	\N	\N	\N	\N	\N	\N	\N	High	Low	Low	Medium	High	t	নিবিড় পর্যবেক্ষণ ও মনোসামাজিক সহায়তা প্রদান করুন।	Submitted	2026-05-07 16:22:33.366436+06	2026-05-07 16:22:33.366436+06
9	RISK-2026-00009	9	2023-04-03	সজল কুমার দাস	\N	\N	\N	\N	\N	\N	\N	\N	\N	High	Low	High	Medium	High	t	নিবিড় পর্যবেক্ষণ ও মনোসামাজিক সহায়তা প্রদান করুন।	Submitted	2026-05-07 16:22:33.409299+06	2026-05-07 16:22:33.409299+06
10	RISK-2026-00010	10	2024-11-18	সজল কুমার দাস	\N	\N	\N	\N	\N	\N	\N	\N	\N	Low	Low	Low	Low	Low	f	নিয়মিত ফলো-আপ এবং কাউন্সেলিং চালু রাখুন।	Submitted	2026-05-07 16:22:33.454347+06	2026-05-07 16:22:33.454347+06
11	RISK-2026-00026	11	2024-04-02	মিসেস শিরিন আক্তার	\N	\N	\N	\N	\N	\N	\N	\N	\N	High	Low	Low	Medium	High	t	নিবিড় পর্যবেক্ষণ ও মনোসামাজিক সহায়তা প্রদান করুন।	Submitted	2026-05-07 16:22:33.537752+06	2026-05-07 16:22:33.537752+06
12	RISK-2026-00027	12	2024-08-10	মিসেস শিরিন আক্তার	\N	\N	\N	\N	\N	\N	\N	\N	\N	Medium	Low	Low	Low	Medium	f	নিয়মিত ফলো-আপ এবং কাউন্সেলিং চালু রাখুন।	Submitted	2026-05-07 16:22:33.582656+06	2026-05-07 16:22:33.582656+06
13	RISK-2026-00028	13	2024-04-02	মিসেস শিরিন আক্তার	\N	\N	\N	\N	\N	\N	\N	\N	\N	High	High	Low	Medium	High	t	নিবিড় পর্যবেক্ষণ ও মনোসামাজিক সহায়তা প্রদান করুন।	Submitted	2026-05-07 16:22:33.634302+06	2026-05-07 16:22:33.634302+06
14	RISK-2026-00029	14	2024-01-23	মিসেস শিরিন আক্তার	\N	\N	\N	\N	\N	\N	\N	\N	\N	Low	Low	Low	Low	Low	f	নিয়মিত ফলো-আপ এবং কাউন্সেলিং চালু রাখুন।	Submitted	2026-05-07 16:22:33.707278+06	2026-05-07 16:22:33.707278+06
15	RISK-2026-00030	15	2024-03-13	মিসেস শিরিন আক্তার	\N	\N	\N	\N	\N	\N	\N	\N	\N	High	Low	Low	Low	Medium	f	নিয়মিত ফলো-আপ এবং কাউন্সেলিং চালু রাখুন।	Submitted	2026-05-07 16:22:33.779546+06	2026-05-07 16:22:33.779546+06
16	RISK-2026-00031	16	2023-03-29	মিসেস শিরিন আক্তার	\N	\N	\N	\N	\N	\N	\N	\N	\N	High	High	Low	Medium	High	t	নিবিড় পর্যবেক্ষণ ও মনোসামাজিক সহায়তা প্রদান করুন।	Submitted	2026-05-07 16:22:33.856218+06	2026-05-07 16:22:33.856218+06
17	RISK-2026-00032	17	2023-04-03	মিসেস শিরিন আক্তার	\N	\N	\N	\N	\N	\N	\N	\N	\N	High	Low	Low	Medium	High	t	নিবিড় পর্যবেক্ষণ ও মনোসামাজিক সহায়তা প্রদান করুন।	Submitted	2026-05-07 16:22:33.955713+06	2026-05-07 16:22:33.955713+06
18	RISK-2026-00033	18	2024-08-10	মিসেস শিরিন আক্তার	\N	\N	\N	\N	\N	\N	\N	\N	\N	Low	Low	Low	Low	Low	f	নিয়মিত ফলো-আপ এবং কাউন্সেলিং চালু রাখুন।	Submitted	2026-05-07 16:22:34.040049+06	2026-05-07 16:22:34.040049+06
19	RISK-2026-00049	19	2024-04-02	মোহাম্মদ বশির আহমেদ	\N	\N	\N	\N	\N	\N	\N	\N	\N	Medium	Low	Medium	Low	Medium	f	নিয়মিত ফলো-আপ এবং কাউন্সেলিং চালু রাখুন।	Submitted	2026-05-07 16:22:34.171649+06	2026-05-07 16:22:34.171649+06
20	RISK-2026-00050	20	2024-06-21	মোহাম্মদ বশির আহমেদ	\N	\N	\N	\N	\N	\N	\N	\N	\N	High	Low	Low	Medium	High	t	নিবিড় পর্যবেক্ষণ ও মনোসামাজিক সহায়তা প্রদান করুন।	Submitted	2026-05-07 16:22:34.248918+06	2026-05-07 16:22:34.248918+06
21	RISK-2026-00051	21	2024-01-23	মোহাম্মদ বশির আহমেদ	\N	\N	\N	\N	\N	\N	\N	\N	\N	Low	Low	Low	Low	Low	f	নিয়মিত ফলো-আপ এবং কাউন্সেলিং চালু রাখুন।	Submitted	2026-05-07 16:22:34.323319+06	2026-05-07 16:22:34.323319+06
22	RISK-2026-00052	22	2024-03-13	মোহাম্মদ বশির আহমেদ	\N	\N	\N	\N	\N	\N	\N	\N	\N	Medium	Low	Medium	Low	Medium	f	নিয়মিত ফলো-আপ এবং কাউন্সেলিং চালু রাখুন।	Submitted	2026-05-07 16:22:34.409103+06	2026-05-07 16:22:34.409103+06
23	RISK-2026-00053	23	2023-04-03	মোহাম্মদ বশির আহমেদ	\N	\N	\N	\N	\N	\N	\N	\N	\N	High	Low	High	Medium	High	t	নিবিড় পর্যবেক্ষণ ও মনোসামাজিক সহায়তা প্রদান করুন।	Submitted	2026-05-07 16:22:34.492181+06	2026-05-07 16:22:34.492181+06
24	RISK-2026-00054	24	2022-04-03	মোহাম্মদ বশির আহমেদ	\N	\N	\N	\N	\N	\N	\N	\N	\N	High	Low	High	Medium	High	t	নিবিড় পর্যবেক্ষণ ও মনোসামাজিক সহায়তা প্রদান করুন।	Submitted	2026-05-07 16:22:34.572344+06	2026-05-07 16:22:34.572344+06
25	RISK-2026-00055	25	2024-08-10	মোহাম্মদ বশির আহমেদ	\N	\N	\N	\N	\N	\N	\N	\N	\N	Low	Low	Low	Low	Low	f	নিয়মিত ফলো-আপ এবং কাউন্সেলিং চালু রাখুন।	Submitted	2026-05-07 16:22:34.653636+06	2026-05-07 16:22:34.653636+06
\.


--
-- Data for Name: role_center_access; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_center_access (id, role_id, center_id, created_at) FROM stdin;
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permissions (id, role_id, module, can_view, can_create, can_edit, can_delete, created_at, updated_at) FROM stdin;
19	10	case_types	f	f	f	f	2026-05-07 16:36:41.007745+06	2026-05-07 18:14:28.769+06
9	10	guardians	f	f	f	f	2026-05-07 16:36:40.963406+06	2026-05-07 18:14:28.724+06
20	10	family_types	f	f	f	f	2026-05-07 16:36:41.011472+06	2026-05-07 18:14:28.772+06
54	1	cases	t	t	t	t	2026-05-07 17:49:23.681634+06	2026-05-07 18:14:27.607+06
55	1	family-socioeconomic	t	t	t	t	2026-05-07 17:49:23.689441+06	2026-05-07 18:14:27.61+06
56	1	health	t	t	t	t	2026-05-07 17:49:23.694989+06	2026-05-07 18:14:27.613+06
57	1	counseling	t	t	t	t	2026-05-07 17:49:23.701003+06	2026-05-07 18:14:27.616+06
58	1	education-skills	t	t	t	t	2026-05-07 17:49:23.707793+06	2026-05-07 18:14:27.619+06
59	1	guardians	t	t	t	t	2026-05-07 17:49:23.714356+06	2026-05-07 18:14:27.623+06
60	1	court-cases	t	t	t	t	2026-05-07 17:49:23.721815+06	2026-05-07 18:14:27.626+06
64	1	follow-ups	t	t	t	t	2026-05-07 17:49:23.750317+06	2026-05-07 18:14:27.638+06
65	1	reports	t	t	t	t	2026-05-07 17:49:23.756064+06	2026-05-07 18:14:27.641+06
66	1	measurement-surveys	t	t	t	t	2026-05-07 17:49:23.76126+06	2026-05-07 18:14:27.644+06
67	1	users	t	t	t	t	2026-05-07 17:49:23.766567+06	2026-05-07 18:14:27.647+06
68	1	centers	t	t	t	t	2026-05-07 17:49:23.772251+06	2026-05-07 18:14:27.65+06
69	1	case_types	t	t	t	t	2026-05-07 17:49:23.779698+06	2026-05-07 18:14:27.653+06
70	1	family_types	t	t	t	t	2026-05-07 17:49:23.785446+06	2026-05-07 18:14:27.655+06
71	1	education	t	t	t	t	2026-05-07 17:49:23.790637+06	2026-05-07 18:14:27.658+06
72	1	address	t	t	t	t	2026-05-07 17:49:23.796098+06	2026-05-07 18:14:27.661+06
73	1	org_structure	t	t	t	t	2026-05-07 17:49:23.801661+06	2026-05-07 18:14:27.664+06
74	1	permissions	t	t	t	t	2026-05-07 17:49:23.806215+06	2026-05-07 18:14:27.667+06
61	1	police-requisitions	t	t	t	t	2026-05-07 17:49:23.728303+06	2026-05-07 18:14:27.629+06
62	1	risk-assessments	t	t	t	t	2026-05-07 17:49:23.736144+06	2026-05-07 18:14:27.632+06
21	10	education	f	f	f	f	2026-05-07 16:36:41.014924+06	2026-05-07 18:14:28.776+06
22	10	address	f	f	f	f	2026-05-07 16:36:41.018433+06	2026-05-07 18:14:28.78+06
23	10	org_structure	f	f	f	f	2026-05-07 16:36:41.021886+06	2026-05-07 18:14:28.785+06
24	10	permissions	f	f	f	f	2026-05-07 16:36:41.025436+06	2026-05-07 18:14:28.789+06
51	1	dashboard	t	t	t	t	2026-05-07 17:49:23.623395+06	2026-05-07 18:14:27.586+06
52	1	admissions	t	t	t	t	2026-05-07 17:49:23.667799+06	2026-05-07 18:14:27.6+06
53	1	children	t	t	t	t	2026-05-07 17:49:23.675658+06	2026-05-07 18:14:27.603+06
63	1	release-records	t	t	t	t	2026-05-07 17:49:23.744601+06	2026-05-07 18:14:27.635+06
75	2	dashboard	t	t	t	t	2026-05-07 17:49:23.812249+06	2026-05-07 18:14:27.683+06
76	2	admissions	t	t	t	t	2026-05-07 17:49:23.820282+06	2026-05-07 18:14:27.687+06
77	2	children	t	t	t	t	2026-05-07 17:49:23.833551+06	2026-05-07 18:14:27.69+06
78	2	cases	t	t	t	t	2026-05-07 17:49:23.841724+06	2026-05-07 18:14:27.693+06
79	2	family-socioeconomic	t	t	t	t	2026-05-07 17:49:23.852598+06	2026-05-07 18:14:27.696+06
80	2	health	t	t	t	t	2026-05-07 17:49:23.857865+06	2026-05-07 18:14:27.699+06
81	2	counseling	t	t	t	t	2026-05-07 17:49:23.863765+06	2026-05-07 18:14:27.702+06
82	2	education-skills	t	t	t	t	2026-05-07 17:49:23.87018+06	2026-05-07 18:14:27.706+06
83	2	guardians	t	t	t	t	2026-05-07 17:49:23.877671+06	2026-05-07 18:14:27.709+06
84	2	court-cases	t	t	t	t	2026-05-07 17:49:23.883155+06	2026-05-07 18:14:27.712+06
85	2	police-requisitions	t	t	t	t	2026-05-07 17:49:23.889542+06	2026-05-07 18:14:27.715+06
86	2	risk-assessments	t	t	t	t	2026-05-07 17:49:23.895786+06	2026-05-07 18:14:27.719+06
87	2	release-records	t	t	t	t	2026-05-07 17:49:23.901864+06	2026-05-07 18:14:27.722+06
88	2	follow-ups	t	t	t	t	2026-05-07 17:49:23.907808+06	2026-05-07 18:14:27.725+06
89	2	reports	t	t	t	t	2026-05-07 17:49:23.913845+06	2026-05-07 18:14:27.729+06
90	2	measurement-surveys	t	t	t	t	2026-05-07 17:49:23.920841+06	2026-05-07 18:14:27.733+06
91	2	users	t	t	t	t	2026-05-07 17:49:23.926168+06	2026-05-07 18:14:27.738+06
92	2	centers	t	t	t	t	2026-05-07 17:49:23.931629+06	2026-05-07 18:14:27.742+06
93	2	case_types	t	t	t	t	2026-05-07 17:49:23.937633+06	2026-05-07 18:14:27.747+06
94	2	family_types	t	t	t	t	2026-05-07 17:49:23.943741+06	2026-05-07 18:14:27.752+06
95	2	education	t	t	t	t	2026-05-07 17:49:23.948519+06	2026-05-07 18:14:27.756+06
96	2	address	t	t	t	t	2026-05-07 17:49:23.954445+06	2026-05-07 18:14:27.761+06
97	2	org_structure	t	t	t	t	2026-05-07 17:49:23.961308+06	2026-05-07 18:14:27.765+06
98	2	permissions	t	t	t	t	2026-05-07 17:49:23.966616+06	2026-05-07 18:14:27.77+06
99	3	dashboard	f	f	f	f	2026-05-07 17:49:23.972341+06	2026-05-07 18:14:27.792+06
100	3	admissions	f	f	f	f	2026-05-07 17:49:23.977793+06	2026-05-07 18:14:27.797+06
101	3	children	f	f	f	f	2026-05-07 17:49:23.982602+06	2026-05-07 18:14:27.802+06
102	3	cases	f	f	f	f	2026-05-07 17:49:23.987253+06	2026-05-07 18:14:27.807+06
103	3	family-socioeconomic	f	f	f	f	2026-05-07 17:49:23.992278+06	2026-05-07 18:14:27.811+06
104	3	health	f	f	f	f	2026-05-07 17:49:24.000052+06	2026-05-07 18:14:27.815+06
105	3	counseling	f	f	f	f	2026-05-07 17:49:24.006786+06	2026-05-07 18:14:27.82+06
106	3	education-skills	f	f	f	f	2026-05-07 17:49:24.012047+06	2026-05-07 18:14:27.824+06
107	3	guardians	f	f	f	f	2026-05-07 17:49:24.01786+06	2026-05-07 18:14:27.829+06
108	3	court-cases	f	f	f	f	2026-05-07 17:49:24.023487+06	2026-05-07 18:14:27.833+06
109	3	police-requisitions	f	f	f	f	2026-05-07 17:49:24.028141+06	2026-05-07 18:14:27.838+06
110	3	risk-assessments	f	f	f	f	2026-05-07 17:49:24.033731+06	2026-05-07 18:14:27.843+06
111	3	release-records	f	f	f	f	2026-05-07 17:49:24.040772+06	2026-05-07 18:14:27.847+06
112	3	follow-ups	f	f	f	f	2026-05-07 17:49:24.045948+06	2026-05-07 18:14:27.852+06
113	3	reports	f	f	f	f	2026-05-07 17:49:24.050644+06	2026-05-07 18:14:27.856+06
114	3	measurement-surveys	f	f	f	f	2026-05-07 17:49:24.055577+06	2026-05-07 18:14:27.86+06
115	3	users	f	f	f	f	2026-05-07 17:49:24.060748+06	2026-05-07 18:14:27.864+06
1	10	dashboard	f	f	f	f	2026-05-07 16:36:40.870091+06	2026-05-07 18:14:28.686+06
2	10	admissions	t	t	t	t	2026-05-07 16:36:40.931593+06	2026-05-07 18:14:28.691+06
3	10	children	t	f	f	f	2026-05-07 16:36:40.935156+06	2026-05-07 18:14:28.696+06
4	10	cases	f	f	f	f	2026-05-07 16:36:40.939278+06	2026-05-07 18:14:28.701+06
5	10	family-socioeconomic	f	f	f	f	2026-05-07 16:36:40.948029+06	2026-05-07 18:14:28.705+06
6	10	health	f	f	f	f	2026-05-07 16:36:40.952143+06	2026-05-07 18:14:28.71+06
7	10	counseling	f	f	f	f	2026-05-07 16:36:40.956025+06	2026-05-07 18:14:28.715+06
8	10	education-skills	f	f	f	f	2026-05-07 16:36:40.959938+06	2026-05-07 18:14:28.72+06
10	10	court-cases	f	f	f	f	2026-05-07 16:36:40.967472+06	2026-05-07 18:14:28.728+06
11	10	police-requisitions	f	f	f	f	2026-05-07 16:36:40.970678+06	2026-05-07 18:14:28.732+06
12	10	risk-assessments	f	f	f	f	2026-05-07 16:36:40.97818+06	2026-05-07 18:14:28.737+06
13	10	release-records	f	f	f	f	2026-05-07 16:36:40.982255+06	2026-05-07 18:14:28.742+06
14	10	follow-ups	f	f	f	f	2026-05-07 16:36:40.986775+06	2026-05-07 18:14:28.746+06
15	10	reports	f	f	f	f	2026-05-07 16:36:40.991186+06	2026-05-07 18:14:28.751+06
16	10	measurement-surveys	f	f	f	f	2026-05-07 16:36:40.995261+06	2026-05-07 18:14:28.756+06
17	10	users	f	f	f	f	2026-05-07 16:36:40.998963+06	2026-05-07 18:14:28.761+06
18	10	centers	f	f	f	f	2026-05-07 16:36:41.002016+06	2026-05-07 18:14:28.765+06
119	3	education	f	f	f	f	2026-05-07 17:49:24.087198+06	2026-05-07 18:14:27.881+06
120	3	address	f	f	f	f	2026-05-07 17:49:24.092594+06	2026-05-07 18:14:27.886+06
121	3	org_structure	f	f	f	f	2026-05-07 17:49:24.098147+06	2026-05-07 18:14:27.89+06
122	3	permissions	f	f	f	f	2026-05-07 17:49:24.103132+06	2026-05-07 18:14:27.895+06
123	4	dashboard	f	f	f	f	2026-05-07 17:49:24.109201+06	2026-05-07 18:14:27.917+06
124	4	admissions	f	f	f	f	2026-05-07 17:49:24.116238+06	2026-05-07 18:14:27.921+06
125	4	children	f	f	f	f	2026-05-07 17:49:24.121493+06	2026-05-07 18:14:27.925+06
126	4	cases	f	f	f	f	2026-05-07 17:49:24.126608+06	2026-05-07 18:14:27.93+06
127	4	family-socioeconomic	f	f	f	f	2026-05-07 17:49:24.132691+06	2026-05-07 18:14:27.934+06
128	4	health	f	f	f	f	2026-05-07 17:49:24.13901+06	2026-05-07 18:14:27.939+06
129	4	counseling	f	f	f	f	2026-05-07 17:49:24.144741+06	2026-05-07 18:14:27.943+06
130	4	education-skills	f	f	f	f	2026-05-07 17:49:24.150583+06	2026-05-07 18:14:27.947+06
131	4	guardians	f	f	f	f	2026-05-07 17:49:24.157535+06	2026-05-07 18:14:27.952+06
132	4	court-cases	f	f	f	f	2026-05-07 17:49:24.16292+06	2026-05-07 18:14:27.956+06
133	4	police-requisitions	f	f	f	f	2026-05-07 17:49:24.168329+06	2026-05-07 18:14:27.962+06
134	4	risk-assessments	f	f	f	f	2026-05-07 17:49:24.172986+06	2026-05-07 18:14:27.966+06
136	4	follow-ups	f	f	f	f	2026-05-07 17:49:24.182755+06	2026-05-07 18:14:27.974+06
137	4	reports	f	f	f	f	2026-05-07 17:49:24.188169+06	2026-05-07 18:14:27.979+06
138	4	measurement-surveys	f	f	f	f	2026-05-07 17:49:24.194949+06	2026-05-07 18:14:27.983+06
139	4	users	f	f	f	f	2026-05-07 17:49:24.200721+06	2026-05-07 18:14:27.989+06
140	4	centers	f	f	f	f	2026-05-07 17:49:24.206539+06	2026-05-07 18:14:27.993+06
141	4	case_types	f	f	f	f	2026-05-07 17:49:24.212286+06	2026-05-07 18:14:27.998+06
142	4	family_types	f	f	f	f	2026-05-07 17:49:24.2178+06	2026-05-07 18:14:28.004+06
143	4	education	f	f	f	f	2026-05-07 17:49:24.222328+06	2026-05-07 18:14:28.008+06
144	4	address	f	f	f	f	2026-05-07 17:49:24.2288+06	2026-05-07 18:14:28.012+06
145	4	org_structure	f	f	f	f	2026-05-07 17:49:24.236736+06	2026-05-07 18:14:28.016+06
146	4	permissions	f	f	f	f	2026-05-07 17:49:24.242539+06	2026-05-07 18:14:28.02+06
147	5	dashboard	t	t	t	f	2026-05-07 17:49:24.248238+06	2026-05-07 18:14:28.046+06
148	5	admissions	t	t	t	f	2026-05-07 17:49:24.253169+06	2026-05-07 18:14:28.051+06
149	5	children	t	t	t	f	2026-05-07 17:49:24.259548+06	2026-05-07 18:14:28.055+06
150	5	cases	t	t	t	f	2026-05-07 17:49:24.265418+06	2026-05-07 18:14:28.061+06
151	5	family-socioeconomic	t	t	t	f	2026-05-07 17:49:24.270848+06	2026-05-07 18:14:28.065+06
152	5	health	t	t	t	f	2026-05-07 17:49:24.280061+06	2026-05-07 18:14:28.07+06
153	5	counseling	t	t	t	f	2026-05-07 17:49:24.286632+06	2026-05-07 18:14:28.075+06
155	5	guardians	t	t	t	f	2026-05-07 17:49:24.298833+06	2026-05-07 18:14:28.084+06
156	5	court-cases	t	t	t	f	2026-05-07 17:49:24.304378+06	2026-05-07 18:14:28.089+06
157	5	police-requisitions	t	t	t	f	2026-05-07 17:49:24.308977+06	2026-05-07 18:14:28.094+06
158	5	risk-assessments	t	t	t	f	2026-05-07 17:49:24.313595+06	2026-05-07 18:14:28.098+06
159	5	release-records	t	t	t	f	2026-05-07 17:49:24.319447+06	2026-05-07 18:14:28.103+06
160	5	follow-ups	t	t	t	f	2026-05-07 17:49:24.323634+06	2026-05-07 18:14:28.108+06
161	5	reports	t	t	t	f	2026-05-07 17:49:24.32692+06	2026-05-07 18:14:28.113+06
162	5	measurement-surveys	t	t	t	f	2026-05-07 17:49:24.330071+06	2026-05-07 18:14:28.117+06
163	5	users	t	t	t	f	2026-05-07 17:49:24.333949+06	2026-05-07 18:14:28.122+06
164	5	centers	t	t	t	f	2026-05-07 17:49:24.337633+06	2026-05-07 18:14:28.127+06
165	5	case_types	t	t	t	f	2026-05-07 17:49:24.34081+06	2026-05-07 18:14:28.131+06
166	5	family_types	t	t	t	f	2026-05-07 17:49:24.34496+06	2026-05-07 18:14:28.135+06
167	5	education	t	t	t	f	2026-05-07 17:49:24.34834+06	2026-05-07 18:14:28.139+06
168	5	address	t	t	t	f	2026-05-07 17:49:24.351541+06	2026-05-07 18:14:28.145+06
169	5	org_structure	t	t	t	f	2026-05-07 17:49:24.354859+06	2026-05-07 18:14:28.15+06
170	5	permissions	t	t	t	f	2026-05-07 17:49:24.35828+06	2026-05-07 18:14:28.154+06
171	6	dashboard	t	f	f	f	2026-05-07 17:49:24.3614+06	2026-05-07 18:14:28.179+06
172	6	admissions	t	f	f	f	2026-05-07 17:49:24.36462+06	2026-05-07 18:14:28.184+06
173	6	children	t	f	f	f	2026-05-07 17:49:24.369591+06	2026-05-07 18:14:28.189+06
174	6	cases	t	f	f	f	2026-05-07 17:49:24.373326+06	2026-05-07 18:14:28.193+06
176	6	health	t	f	f	f	2026-05-07 17:49:24.380097+06	2026-05-07 18:14:28.201+06
177	6	counseling	t	f	f	f	2026-05-07 17:49:24.383553+06	2026-05-07 18:14:28.205+06
178	6	education-skills	t	f	f	f	2026-05-07 17:49:24.386913+06	2026-05-07 18:14:28.21+06
179	6	guardians	t	f	f	f	2026-05-07 17:49:24.390268+06	2026-05-07 18:14:28.215+06
180	6	court-cases	t	f	f	f	2026-05-07 17:49:24.39501+06	2026-05-07 18:14:28.22+06
181	6	police-requisitions	t	f	f	f	2026-05-07 17:49:24.398431+06	2026-05-07 18:14:28.225+06
182	6	risk-assessments	t	f	f	f	2026-05-07 17:49:24.40165+06	2026-05-07 18:14:28.229+06
183	6	release-records	t	f	f	f	2026-05-07 17:49:24.404808+06	2026-05-07 18:14:28.235+06
184	6	follow-ups	t	f	f	f	2026-05-07 17:49:24.407956+06	2026-05-07 18:14:28.24+06
185	6	reports	f	f	f	f	2026-05-07 17:49:24.410553+06	2026-05-07 18:14:28.245+06
186	6	measurement-surveys	t	f	f	f	2026-05-07 17:49:24.413471+06	2026-05-07 18:14:28.249+06
187	6	users	f	f	f	f	2026-05-07 17:49:24.417843+06	2026-05-07 18:14:28.253+06
188	6	centers	f	f	f	f	2026-05-07 17:49:24.421033+06	2026-05-07 18:14:28.257+06
189	6	case_types	f	f	f	f	2026-05-07 17:49:24.424136+06	2026-05-07 18:14:28.261+06
190	6	family_types	f	f	f	f	2026-05-07 17:49:24.427288+06	2026-05-07 18:14:28.266+06
191	6	education	f	f	f	f	2026-05-07 17:49:24.430367+06	2026-05-07 18:14:28.271+06
192	6	address	f	f	f	f	2026-05-07 17:49:24.433054+06	2026-05-07 18:14:28.277+06
193	6	org_structure	f	f	f	f	2026-05-07 17:49:24.436019+06	2026-05-07 18:14:28.282+06
194	6	permissions	f	f	f	f	2026-05-07 17:49:24.439893+06	2026-05-07 18:14:28.287+06
195	7	dashboard	t	f	f	f	2026-05-07 17:49:24.442929+06	2026-05-07 18:14:28.309+06
197	7	children	t	f	f	f	2026-05-07 17:49:24.44971+06	2026-05-07 18:14:28.318+06
198	7	cases	t	t	t	t	2026-05-07 17:49:24.452863+06	2026-05-07 18:14:28.322+06
199	7	family-socioeconomic	t	f	f	f	2026-05-07 17:49:24.455814+06	2026-05-07 18:14:28.327+06
200	7	health	t	f	f	f	2026-05-07 17:49:24.458988+06	2026-05-07 18:14:28.331+06
201	7	counseling	t	f	f	f	2026-05-07 17:49:24.462749+06	2026-05-07 18:14:28.336+06
202	7	education-skills	t	f	f	f	2026-05-07 17:49:24.465739+06	2026-05-07 18:14:28.34+06
203	7	guardians	t	f	f	f	2026-05-07 17:49:24.46908+06	2026-05-07 18:14:28.344+06
204	7	court-cases	t	t	t	t	2026-05-07 17:49:24.472229+06	2026-05-07 18:14:28.348+06
205	7	police-requisitions	t	f	f	f	2026-05-07 17:49:24.475395+06	2026-05-07 18:14:28.353+06
206	7	risk-assessments	t	f	f	f	2026-05-07 17:49:24.478698+06	2026-05-07 18:14:28.357+06
207	7	release-records	t	f	f	f	2026-05-07 17:49:24.482326+06	2026-05-07 18:14:28.361+06
208	7	follow-ups	t	f	f	f	2026-05-07 17:49:24.485897+06	2026-05-07 18:14:28.365+06
209	7	reports	f	f	f	f	2026-05-07 17:49:24.48906+06	2026-05-07 18:14:28.37+06
210	7	measurement-surveys	t	f	f	f	2026-05-07 17:49:24.491873+06	2026-05-07 18:14:28.375+06
211	7	users	f	f	f	f	2026-05-07 17:49:24.495067+06	2026-05-07 18:14:28.379+06
212	7	centers	f	f	f	f	2026-05-07 17:49:24.497932+06	2026-05-07 18:14:28.384+06
214	7	family_types	f	f	f	f	2026-05-07 17:49:24.504729+06	2026-05-07 18:14:28.394+06
215	7	education	f	f	f	f	2026-05-07 17:49:24.508573+06	2026-05-07 18:14:28.398+06
216	7	address	f	f	f	f	2026-05-07 17:49:24.511779+06	2026-05-07 18:14:28.402+06
217	7	org_structure	f	f	f	f	2026-05-07 17:49:24.514918+06	2026-05-07 18:14:28.406+06
218	7	permissions	f	f	f	f	2026-05-07 17:49:24.517985+06	2026-05-07 18:14:28.41+06
219	8	dashboard	f	f	f	f	2026-05-07 17:49:24.521616+06	2026-05-07 18:14:28.432+06
220	8	admissions	f	f	f	f	2026-05-07 17:49:24.524637+06	2026-05-07 18:14:28.437+06
221	8	children	f	f	f	f	2026-05-07 17:49:24.528047+06	2026-05-07 18:14:28.442+06
222	8	cases	f	f	f	f	2026-05-07 17:49:24.531909+06	2026-05-07 18:14:28.447+06
223	8	family-socioeconomic	f	f	f	f	2026-05-07 17:49:24.535011+06	2026-05-07 18:14:28.452+06
224	8	health	f	f	f	f	2026-05-07 17:49:24.538089+06	2026-05-07 18:14:28.456+06
225	8	counseling	f	f	f	f	2026-05-07 17:49:24.540985+06	2026-05-07 18:14:28.46+06
226	8	education-skills	f	f	f	f	2026-05-07 17:49:24.543969+06	2026-05-07 18:14:28.465+06
227	8	guardians	f	f	f	f	2026-05-07 17:49:24.546789+06	2026-05-07 18:14:28.47+06
228	8	court-cases	f	f	f	f	2026-05-07 17:49:24.550162+06	2026-05-07 18:14:28.476+06
230	8	risk-assessments	f	f	f	f	2026-05-07 17:49:24.557962+06	2026-05-07 18:14:28.486+06
117	3	case_types	f	f	f	f	2026-05-07 17:49:24.076408+06	2026-05-07 18:14:27.872+06
233	8	reports	f	f	f	f	2026-05-07 17:49:24.566928+06	2026-05-07 18:14:28.5+06
234	8	measurement-surveys	f	f	f	f	2026-05-07 17:49:24.570198+06	2026-05-07 18:14:28.504+06
235	8	users	f	f	f	f	2026-05-07 17:49:24.573854+06	2026-05-07 18:14:28.509+06
236	8	centers	f	f	f	f	2026-05-07 17:49:24.577708+06	2026-05-07 18:14:28.513+06
237	8	case_types	f	f	f	f	2026-05-07 17:49:24.580471+06	2026-05-07 18:14:28.517+06
238	8	family_types	f	f	f	f	2026-05-07 17:49:24.583205+06	2026-05-07 18:14:28.521+06
239	8	education	f	f	f	f	2026-05-07 17:49:24.585997+06	2026-05-07 18:14:28.525+06
240	8	address	f	f	f	f	2026-05-07 17:49:24.588824+06	2026-05-07 18:14:28.529+06
241	8	org_structure	f	f	f	f	2026-05-07 17:49:24.591659+06	2026-05-07 18:14:28.533+06
242	8	permissions	f	f	f	f	2026-05-07 17:49:24.594689+06	2026-05-07 18:14:28.538+06
244	9	admissions	t	t	t	t	2026-05-07 17:49:24.6014+06	2026-05-11 18:07:56.268+06
245	9	children	t	t	t	t	2026-05-07 17:49:24.604267+06	2026-05-11 18:07:56.272+06
246	9	cases	t	t	t	t	2026-05-07 17:49:24.607143+06	2026-05-11 18:07:56.275+06
248	9	health	t	f	f	f	2026-05-07 17:49:24.613049+06	2026-05-11 18:07:56.283+06
249	9	counseling	t	f	f	f	2026-05-07 17:49:24.616272+06	2026-05-11 18:07:56.286+06
250	9	education-skills	t	f	f	f	2026-05-07 17:49:24.620396+06	2026-05-11 18:07:56.289+06
251	9	guardians	t	f	f	f	2026-05-07 17:49:24.623532+06	2026-05-11 18:07:56.292+06
252	9	court-cases	t	f	f	f	2026-05-07 17:49:24.626702+06	2026-05-11 18:07:56.296+06
253	9	police-requisitions	t	f	f	f	2026-05-07 17:49:24.63+06	2026-05-11 18:07:56.299+06
254	9	risk-assessments	t	f	f	f	2026-05-07 17:49:24.633001+06	2026-05-11 18:07:56.303+06
255	9	release-records	t	f	f	f	2026-05-07 17:49:24.636131+06	2026-05-11 18:07:56.308+06
256	9	follow-ups	t	f	f	f	2026-05-07 17:49:24.639669+06	2026-05-11 18:07:56.311+06
257	9	reports	t	f	f	f	2026-05-07 17:49:24.643154+06	2026-05-11 18:07:56.314+06
258	9	measurement-surveys	t	f	f	f	2026-05-07 17:49:24.646131+06	2026-05-11 18:07:56.318+06
259	9	users	f	f	f	f	2026-05-07 17:49:24.64893+06	2026-05-11 18:07:56.321+06
260	9	centers	f	f	f	f	2026-05-07 17:49:24.651716+06	2026-05-11 18:07:56.324+06
261	9	case_types	f	f	f	f	2026-05-07 17:49:24.654512+06	2026-05-11 18:07:56.327+06
262	9	family_types	f	f	f	f	2026-05-07 17:49:24.657228+06	2026-05-11 18:07:56.333+06
263	9	education	f	f	f	f	2026-05-07 17:49:24.660794+06	2026-05-11 18:07:56.335+06
264	9	address	f	f	f	f	2026-05-07 17:49:24.664384+06	2026-05-11 18:07:56.339+06
265	9	org_structure	f	f	f	f	2026-05-07 17:49:24.66746+06	2026-05-11 18:07:56.342+06
266	9	permissions	f	f	f	f	2026-05-07 17:49:24.670312+06	2026-05-11 18:07:56.345+06
291	11	dashboard	t	f	f	f	2026-05-07 17:49:24.746773+06	2026-05-07 18:14:28.812+06
292	11	admissions	t	f	f	f	2026-05-07 17:49:24.750104+06	2026-05-07 18:14:28.816+06
293	11	children	t	f	f	f	2026-05-07 17:49:24.753277+06	2026-05-07 18:14:28.821+06
295	11	family-socioeconomic	t	f	f	f	2026-05-07 17:49:24.759546+06	2026-05-07 18:14:28.83+06
296	11	health	t	f	f	f	2026-05-07 17:49:24.762672+06	2026-05-07 18:14:28.834+06
297	11	counseling	t	f	f	f	2026-05-07 17:49:24.765571+06	2026-05-07 18:14:28.838+06
298	11	education-skills	t	f	f	f	2026-05-07 17:49:24.768879+06	2026-05-07 18:14:28.843+06
299	11	guardians	t	f	f	f	2026-05-07 17:49:24.772394+06	2026-05-07 18:14:28.847+06
300	11	court-cases	t	f	f	f	2026-05-07 17:49:24.77538+06	2026-05-07 18:14:28.852+06
301	11	police-requisitions	t	f	f	f	2026-05-07 17:49:24.778476+06	2026-05-07 18:14:28.856+06
302	11	risk-assessments	t	f	f	f	2026-05-07 17:49:24.781586+06	2026-05-07 18:14:28.861+06
303	11	release-records	t	f	f	f	2026-05-07 17:49:24.784755+06	2026-05-07 18:14:28.866+06
304	11	follow-ups	t	f	f	f	2026-05-07 17:49:24.787639+06	2026-05-07 18:14:28.87+06
305	11	reports	t	f	f	f	2026-05-07 17:49:24.790773+06	2026-05-07 18:14:28.874+06
306	11	measurement-surveys	t	f	f	f	2026-05-07 17:49:24.79424+06	2026-05-07 18:14:28.878+06
307	11	users	t	f	f	f	2026-05-07 17:49:24.797592+06	2026-05-07 18:14:28.883+06
308	11	centers	t	f	f	f	2026-05-07 17:49:24.800855+06	2026-05-07 18:14:28.889+06
309	11	case_types	t	f	f	f	2026-05-07 17:49:24.804119+06	2026-05-07 18:14:28.894+06
311	11	education	t	f	f	f	2026-05-07 17:49:24.810148+06	2026-05-07 18:14:28.903+06
312	11	address	t	f	f	f	2026-05-07 17:49:24.813292+06	2026-05-07 18:14:28.907+06
313	11	org_structure	t	f	f	f	2026-05-07 17:49:24.816673+06	2026-05-07 18:14:28.911+06
314	11	permissions	t	f	f	f	2026-05-07 17:49:24.820102+06	2026-05-07 18:14:28.916+06
315	12	dashboard	t	f	f	f	2026-05-07 17:49:24.823143+06	2026-05-07 18:14:28.936+06
316	12	admissions	t	f	f	f	2026-05-07 17:49:24.826255+06	2026-05-07 18:14:28.941+06
317	12	children	t	f	f	f	2026-05-07 17:49:24.829201+06	2026-05-07 18:14:28.946+06
318	12	cases	t	f	f	f	2026-05-07 17:49:24.831997+06	2026-05-07 18:14:28.951+06
319	12	family-socioeconomic	t	f	f	f	2026-05-07 17:49:24.835331+06	2026-05-07 18:14:28.956+06
320	12	health	t	f	f	f	2026-05-07 17:49:24.839328+06	2026-05-07 18:14:28.96+06
321	12	counseling	t	f	f	f	2026-05-07 17:49:24.842671+06	2026-05-07 18:14:28.964+06
322	12	education-skills	t	f	f	f	2026-05-07 17:49:24.845894+06	2026-05-07 18:14:28.969+06
323	12	guardians	t	f	f	f	2026-05-07 17:49:24.84887+06	2026-05-07 18:14:28.974+06
324	12	court-cases	t	f	f	f	2026-05-07 17:49:24.851605+06	2026-05-07 18:14:28.979+06
325	12	police-requisitions	t	f	f	f	2026-05-07 17:49:24.854377+06	2026-05-07 18:14:28.983+06
326	12	risk-assessments	t	f	f	f	2026-05-07 17:49:24.857489+06	2026-05-07 18:14:28.988+06
327	12	release-records	t	f	f	f	2026-05-07 17:49:24.862153+06	2026-05-07 18:14:28.993+06
328	12	follow-ups	t	f	f	f	2026-05-07 17:49:24.865351+06	2026-05-07 18:14:28.998+06
329	12	reports	t	f	f	f	2026-05-07 17:49:24.868287+06	2026-05-07 18:14:29.003+06
331	12	users	t	f	f	f	2026-05-07 17:49:24.873896+06	2026-05-07 18:14:29.011+06
332	12	centers	t	f	f	f	2026-05-07 17:49:24.876869+06	2026-05-07 18:14:29.015+06
333	12	case_types	t	f	f	f	2026-05-07 17:49:24.880029+06	2026-05-07 18:14:29.02+06
334	12	family_types	t	f	f	f	2026-05-07 17:49:24.883824+06	2026-05-07 18:14:29.024+06
335	12	education	t	f	f	f	2026-05-07 17:49:24.887241+06	2026-05-07 18:14:29.028+06
336	12	address	t	f	f	f	2026-05-07 17:49:24.890811+06	2026-05-07 18:14:29.032+06
337	12	org_structure	t	f	f	f	2026-05-07 17:49:24.893864+06	2026-05-07 18:14:29.036+06
338	12	permissions	t	f	f	f	2026-05-07 17:49:24.896814+06	2026-05-07 18:14:29.04+06
243	9	dashboard	t	f	f	f	2026-05-07 17:49:24.598479+06	2026-05-11 18:07:56.194+06
363	1	roles	t	t	t	t	2026-05-07 17:56:15.805875+06	2026-05-07 18:14:27.67+06
364	1	classes	t	t	t	t	2026-05-07 17:56:15.812309+06	2026-05-07 18:14:27.673+06
365	1	trainings	t	t	t	t	2026-05-07 17:56:15.818051+06	2026-05-07 18:14:27.676+06
366	1	workflow	t	t	t	t	2026-05-07 17:56:15.835746+06	2026-05-07 18:14:27.68+06
391	2	roles	t	t	t	t	2026-05-07 17:56:15.996732+06	2026-05-07 18:14:27.774+06
392	2	classes	t	t	t	t	2026-05-07 17:56:16.002202+06	2026-05-07 18:14:27.779+06
393	2	trainings	t	t	t	t	2026-05-07 17:56:16.007196+06	2026-05-07 18:14:27.783+06
394	2	workflow	t	t	t	t	2026-05-07 17:56:16.011555+06	2026-05-07 18:14:27.788+06
116	3	centers	f	f	f	f	2026-05-07 17:49:24.066177+06	2026-05-07 18:14:27.868+06
419	3	roles	f	f	f	f	2026-05-07 17:56:16.140852+06	2026-05-07 18:14:27.899+06
420	3	classes	f	f	f	f	2026-05-07 17:56:16.146118+06	2026-05-07 18:14:27.904+06
421	3	trainings	f	f	f	f	2026-05-07 17:56:16.150239+06	2026-05-07 18:14:27.908+06
422	3	workflow	f	f	f	f	2026-05-07 17:56:16.153906+06	2026-05-07 18:14:27.912+06
135	4	release-records	f	f	f	f	2026-05-07 17:49:24.177579+06	2026-05-07 18:14:27.97+06
447	4	roles	f	f	f	f	2026-05-07 17:56:16.234672+06	2026-05-07 18:14:28.025+06
448	4	classes	f	f	f	f	2026-05-07 17:56:16.238894+06	2026-05-07 18:14:28.029+06
449	4	trainings	f	f	f	f	2026-05-07 17:56:16.242718+06	2026-05-07 18:14:28.034+06
450	4	workflow	f	f	f	f	2026-05-07 17:56:16.246122+06	2026-05-07 18:14:28.04+06
154	5	education-skills	t	t	t	f	2026-05-07 17:49:24.292347+06	2026-05-07 18:14:28.08+06
475	5	roles	t	t	t	f	2026-05-07 17:56:16.354818+06	2026-05-07 18:14:28.159+06
476	5	classes	t	t	t	f	2026-05-07 17:56:16.360574+06	2026-05-07 18:14:28.165+06
477	5	trainings	t	t	t	f	2026-05-07 17:56:16.366373+06	2026-05-07 18:14:28.17+06
478	5	workflow	t	t	t	f	2026-05-07 17:56:16.371593+06	2026-05-07 18:14:28.175+06
175	6	family-socioeconomic	t	f	f	f	2026-05-07 17:49:24.376747+06	2026-05-07 18:14:28.197+06
503	6	roles	t	f	f	f	2026-05-07 17:56:16.502283+06	2026-05-07 18:14:28.291+06
504	6	classes	t	f	f	f	2026-05-07 17:56:16.507148+06	2026-05-07 18:14:28.295+06
505	6	trainings	t	f	f	f	2026-05-07 17:56:16.512236+06	2026-05-07 18:14:28.299+06
506	6	workflow	t	f	f	f	2026-05-07 17:56:16.516978+06	2026-05-07 18:14:28.304+06
213	7	case_types	f	f	f	f	2026-05-07 17:49:24.500936+06	2026-05-07 18:14:28.389+06
232	8	follow-ups	f	f	f	f	2026-05-07 17:49:24.563777+06	2026-05-07 18:14:28.496+06
118	3	family_types	f	f	f	f	2026-05-07 17:49:24.081966+06	2026-05-07 18:14:27.877+06
196	7	admissions	t	f	f	f	2026-05-07 17:49:24.446477+06	2026-05-07 18:14:28.313+06
531	7	roles	t	f	f	f	2026-05-07 17:56:16.634239+06	2026-05-07 18:14:28.415+06
532	7	classes	t	f	f	f	2026-05-07 17:56:16.639326+06	2026-05-07 18:14:28.419+06
533	7	trainings	t	f	f	f	2026-05-07 17:56:16.644525+06	2026-05-07 18:14:28.423+06
534	7	workflow	t	f	f	f	2026-05-07 17:56:16.650367+06	2026-05-07 18:14:28.428+06
229	8	police-requisitions	f	f	f	f	2026-05-07 17:49:24.55462+06	2026-05-07 18:14:28.481+06
231	8	release-records	f	f	f	f	2026-05-07 17:49:24.560879+06	2026-05-07 18:14:28.491+06
559	8	roles	f	f	f	f	2026-05-07 17:56:16.772771+06	2026-05-07 18:14:28.543+06
560	8	classes	f	f	f	f	2026-05-07 17:56:16.776931+06	2026-05-07 18:14:28.548+06
561	8	trainings	f	f	f	f	2026-05-07 17:56:16.781161+06	2026-05-07 18:14:28.552+06
562	8	workflow	f	f	f	f	2026-05-07 17:56:16.785612+06	2026-05-07 18:14:28.556+06
587	9	roles	t	f	f	f	2026-05-07 17:56:16.895855+06	2026-05-07 18:14:28.668+06
588	9	classes	t	f	f	f	2026-05-07 17:56:16.900012+06	2026-05-07 18:14:28.673+06
589	9	trainings	t	f	f	f	2026-05-07 17:56:16.904354+06	2026-05-07 18:14:28.678+06
590	9	workflow	t	f	f	f	2026-05-07 17:56:16.908225+06	2026-05-07 18:14:28.682+06
615	10	roles	f	f	f	f	2026-05-07 17:56:17.014062+06	2026-05-07 18:14:28.794+06
616	10	classes	f	f	f	f	2026-05-07 17:56:17.018413+06	2026-05-07 18:14:28.798+06
617	10	trainings	f	f	f	f	2026-05-07 17:56:17.022321+06	2026-05-07 18:14:28.803+06
618	10	workflow	f	f	f	f	2026-05-07 17:56:17.026335+06	2026-05-07 18:14:28.808+06
294	11	cases	t	f	f	f	2026-05-07 17:49:24.7565+06	2026-05-07 18:14:28.825+06
310	11	family_types	t	f	f	f	2026-05-07 17:49:24.807229+06	2026-05-07 18:14:28.898+06
643	11	roles	t	f	f	f	2026-05-07 17:56:17.137825+06	2026-05-07 18:14:28.919+06
644	11	classes	t	f	f	f	2026-05-07 17:56:17.142865+06	2026-05-07 18:14:28.924+06
645	11	trainings	t	f	f	f	2026-05-07 17:56:17.148567+06	2026-05-07 18:14:28.928+06
646	11	workflow	t	f	f	f	2026-05-07 17:56:17.154202+06	2026-05-07 18:14:28.932+06
330	12	measurement-surveys	t	f	f	f	2026-05-07 17:49:24.871099+06	2026-05-07 18:14:29.008+06
671	12	roles	t	f	f	f	2026-05-07 17:56:17.277589+06	2026-05-07 18:14:29.045+06
672	12	classes	t	f	f	f	2026-05-07 17:56:17.281764+06	2026-05-07 18:14:29.049+06
673	12	trainings	t	f	f	f	2026-05-07 17:56:17.285753+06	2026-05-07 18:14:29.053+06
674	12	workflow	t	f	f	f	2026-05-07 17:56:17.289772+06	2026-05-07 18:14:29.057+06
247	9	family-socioeconomic	t	f	f	f	2026-05-07 17:49:24.610055+06	2026-05-11 18:07:56.279+06
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, role_name, scope, access_type, description, center_id, created_at, is_active) FROM stdin;
1	Super Admin	All	Full Control	Full system access	\N	2026-05-07 16:22:14.759499+06	t
2	Head Office	All Centers	Global	National-level visibility	\N	2026-05-07 16:22:14.759499+06	t
3	DD Division	Division	Filtered	Division-level access	\N	2026-05-07 16:22:14.759499+06	t
4	DD District	District	Filtered	District-level access	\N	2026-05-07 16:22:14.759499+06	t
5	Center Admin	Center	Full Control	Full center control	\N	2026-05-07 16:22:14.759499+06	t
6	Superintendent	Center	Full + Approval	Final approval authority	\N	2026-05-07 16:22:14.759499+06	t
7	Probation Officer	Center	Review	Third level review — forwards to Superintendent	\N	2026-05-07 16:22:14.759499+06	t
8	District Facilitator	Center	Review	Second level review — forwards to Probation Officer	\N	2026-05-07 16:22:14.759499+06	t
9	Case Worker	Center	Submit	Enters inhabitant data and submits to District Facilitator	\N	2026-05-07 16:22:14.759499+06	t
10	Data Entry Operator	Center	Draft + Submit	Initial entry for admission and child profile	\N	2026-05-07 16:22:14.759499+06	t
11	House Parent	Center	Draft	Can create drafts	\N	2026-05-07 16:22:14.759499+06	t
12	Worker	Center	Draft	Can create draft entries	\N	2026-05-07 16:22:14.759499+06	t
\.


--
-- Data for Name: trainings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trainings (id, name_bn, name_en, is_active, created_at, updated_at) FROM stdin;
1	ইলেকট্রিক্যাল	Electrical	t	2026-05-07 16:22:32.611304+06	2026-05-07 16:22:32.611304+06
2	কম্পিউটার প্রশিক্ষণ	Computer Training	t	2026-05-07 16:22:32.611304+06	2026-05-07 16:22:32.611304+06
3	প্লাম্বিং	Plumbing	t	2026-05-07 16:22:32.611304+06	2026-05-07 16:22:32.611304+06
4	অটোমোবাইল	Automobile	t	2026-05-07 16:22:32.611304+06	2026-05-07 16:22:32.611304+06
5	খাদ্য প্রস্তুতকরণ	Food Preparation	t	2026-05-07 16:22:32.611304+06	2026-05-07 16:22:32.611304+06
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, full_name, email, password_hash, role_id, center_id, administrative_unit_id, is_active, created_at, updated_at, workflow_role) FROM stdin;
1	superadmin	Super Administrator	superadmin@dss.gov.bd	$2b$12$7lz1DJitZ.e9DxfBO9UzMO3VV5WeXPQ9T3TvINIHB3dufiXrmVrY.	1	\N	\N	t	2026-05-07 16:22:15.455953+06	2026-05-07 16:22:15.455953+06	\N
2	headoffice	Head Office Director	headoffice@dss.gov.bd	$2b$12$7lz1DJitZ.e9DxfBO9UzMO3VV5WeXPQ9T3TvINIHB3dufiXrmVrY.	2	\N	\N	t	2026-05-07 16:22:15.455953+06	2026-05-07 16:22:15.455953+06	\N
3	centeradmin_tongi	Center Admin — Tongi	centeradmin.tongi@dss.gov.bd	$2b$12$7lz1DJitZ.e9DxfBO9UzMO3VV5WeXPQ9T3TvINIHB3dufiXrmVrY.	5	2	\N	t	2026-05-07 16:22:15.455953+06	2026-05-07 16:22:15.455953+06	\N
4	supt_tongi	Superintendent — Tongi	superintendent.tongi@dss.gov.bd	$2b$12$7lz1DJitZ.e9DxfBO9UzMO3VV5WeXPQ9T3TvINIHB3dufiXrmVrY.	6	2	\N	t	2026-05-07 16:22:15.455953+06	2026-05-07 16:22:15.455953+06	\N
5	po_tongi	Probation Officer — Tongi	probation.tongi@dss.gov.bd	$2b$12$7lz1DJitZ.e9DxfBO9UzMO3VV5WeXPQ9T3TvINIHB3dufiXrmVrY.	7	2	\N	t	2026-05-07 16:22:15.455953+06	2026-05-07 16:22:15.455953+06	\N
6	df_tongi	District Facilitator — Tongi	df.tongi@dss.gov.bd	$2b$12$7lz1DJitZ.e9DxfBO9UzMO3VV5WeXPQ9T3TvINIHB3dufiXrmVrY.	8	2	\N	t	2026-05-07 16:22:15.455953+06	2026-05-07 16:22:15.455953+06	\N
7	cw_tongi	Case Worker — Tongi	caseworker.tongi@dss.gov.bd	$2b$12$7lz1DJitZ.e9DxfBO9UzMO3VV5WeXPQ9T3TvINIHB3dufiXrmVrY.	9	2	\N	t	2026-05-07 16:22:15.455953+06	2026-05-07 16:22:15.455953+06	\N
8	deo_tongi	Data Entry Operator — Tongi	deo.tongi@dss.gov.bd	$2b$12$7lz1DJitZ.e9DxfBO9UzMO3VV5WeXPQ9T3TvINIHB3dufiXrmVrY.	10	2	\N	t	2026-05-07 16:22:15.455953+06	2026-05-07 16:22:15.455953+06	\N
9	houseparent_tongi	House Parent — Tongi	houseparent.tongi@dss.gov.bd	$2b$12$7lz1DJitZ.e9DxfBO9UzMO3VV5WeXPQ9T3TvINIHB3dufiXrmVrY.	11	2	\N	t	2026-05-07 16:22:15.455953+06	2026-05-07 16:22:15.455953+06	\N
10	centeradmin_konabari	Center Admin — Konabari	centeradmin.konabari@dss.gov.bd	$2b$12$7lz1DJitZ.e9DxfBO9UzMO3VV5WeXPQ9T3TvINIHB3dufiXrmVrY.	5	3	\N	t	2026-05-07 16:22:15.455953+06	2026-05-07 16:22:15.455953+06	\N
11	supt_konabari	Superintendent — Konabari	superintendent.konabari@dss.gov.bd	$2b$12$7lz1DJitZ.e9DxfBO9UzMO3VV5WeXPQ9T3TvINIHB3dufiXrmVrY.	6	3	\N	t	2026-05-07 16:22:15.455953+06	2026-05-07 16:22:15.455953+06	\N
12	po_konabari	Probation Officer — Konabari	probation.konabari@dss.gov.bd	$2b$12$7lz1DJitZ.e9DxfBO9UzMO3VV5WeXPQ9T3TvINIHB3dufiXrmVrY.	7	3	\N	t	2026-05-07 16:22:15.455953+06	2026-05-07 16:22:15.455953+06	\N
13	df_konabari	District Facilitator — Konabari	df.konabari@dss.gov.bd	$2b$12$7lz1DJitZ.e9DxfBO9UzMO3VV5WeXPQ9T3TvINIHB3dufiXrmVrY.	8	3	\N	t	2026-05-07 16:22:15.455953+06	2026-05-07 16:22:15.455953+06	\N
14	cw_konabari	Case Worker — Konabari	caseworker.konabari@dss.gov.bd	$2b$12$7lz1DJitZ.e9DxfBO9UzMO3VV5WeXPQ9T3TvINIHB3dufiXrmVrY.	9	3	\N	t	2026-05-07 16:22:15.455953+06	2026-05-07 16:22:15.455953+06	\N
15	deo_konabari	Data Entry Operator — Konabari	deo.konabari@dss.gov.bd	$2b$12$7lz1DJitZ.e9DxfBO9UzMO3VV5WeXPQ9T3TvINIHB3dufiXrmVrY.	10	3	\N	t	2026-05-07 16:22:15.455953+06	2026-05-07 16:22:15.455953+06	\N
16	houseparent_konabari	House Parent — Konabari	houseparent.konabari@dss.gov.bd	$2b$12$7lz1DJitZ.e9DxfBO9UzMO3VV5WeXPQ9T3TvINIHB3dufiXrmVrY.	11	3	\N	t	2026-05-07 16:22:15.455953+06	2026-05-07 16:22:15.455953+06	\N
17	centeradmin_fulerhat	Center Admin — Fulerhat	centeradmin.fulerhat@dss.gov.bd	$2b$12$7lz1DJitZ.e9DxfBO9UzMO3VV5WeXPQ9T3TvINIHB3dufiXrmVrY.	5	4	\N	t	2026-05-07 16:22:15.455953+06	2026-05-07 16:22:15.455953+06	\N
18	supt_fulerhat	Superintendent — Fulerhat	superintendent.fulerhat@dss.gov.bd	$2b$12$7lz1DJitZ.e9DxfBO9UzMO3VV5WeXPQ9T3TvINIHB3dufiXrmVrY.	6	4	\N	t	2026-05-07 16:22:15.455953+06	2026-05-07 16:22:15.455953+06	\N
19	po_fulerhat	Probation Officer — Fulerhat	probation.fulerhat@dss.gov.bd	$2b$12$7lz1DJitZ.e9DxfBO9UzMO3VV5WeXPQ9T3TvINIHB3dufiXrmVrY.	7	4	\N	t	2026-05-07 16:22:15.455953+06	2026-05-07 16:22:15.455953+06	\N
20	df_fulerhat	District Facilitator — Fulerhat	df.fulerhat@dss.gov.bd	$2b$12$7lz1DJitZ.e9DxfBO9UzMO3VV5WeXPQ9T3TvINIHB3dufiXrmVrY.	8	4	\N	t	2026-05-07 16:22:15.455953+06	2026-05-07 16:22:15.455953+06	\N
21	cw_fulerhat	Case Worker — Fulerhat	caseworker.fulerhat@dss.gov.bd	$2b$12$7lz1DJitZ.e9DxfBO9UzMO3VV5WeXPQ9T3TvINIHB3dufiXrmVrY.	9	4	\N	t	2026-05-07 16:22:15.455953+06	2026-05-07 16:22:15.455953+06	\N
22	deo_fulerhat	Data Entry Operator — Fulerhat	deo.fulerhat@dss.gov.bd	$2b$12$7lz1DJitZ.e9DxfBO9UzMO3VV5WeXPQ9T3TvINIHB3dufiXrmVrY.	10	4	\N	t	2026-05-07 16:22:15.455953+06	2026-05-07 16:22:15.455953+06	\N
23	houseparent_fulerhat	House Parent — Fulerhat	houseparent.fulerhat@dss.gov.bd	$2b$12$7lz1DJitZ.e9DxfBO9UzMO3VV5WeXPQ9T3TvINIHB3dufiXrmVrY.	11	4	\N	t	2026-05-07 16:22:15.455953+06	2026-05-07 16:22:15.455953+06	\N
\.


--
-- Data for Name: workflow_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workflow_logs (id, record_type, record_id, user_id, action, message, created_at) FROM stdin;
\.


--
-- Name: administrative_units_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.administrative_units_id_seq', 8, true);


--
-- Name: admissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admissions_id_seq', 26, true);


--
-- Name: case_agreements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.case_agreements_id_seq', 1, false);


--
-- Name: case_detail_assessments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.case_detail_assessments_id_seq', 1, false);


--
-- Name: case_intervention_plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.case_intervention_plans_id_seq', 1, false);


--
-- Name: case_risk_assessments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.case_risk_assessments_id_seq', 1, false);


--
-- Name: case_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.case_types_id_seq', 1, false);


--
-- Name: cases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cases_id_seq', 25, true);


--
-- Name: centers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.centers_id_seq', 4, true);


--
-- Name: children_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.children_id_seq', 26, true);


--
-- Name: classes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.classes_id_seq', 12, true);


--
-- Name: counseling_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.counseling_sessions_id_seq', 50, true);


--
-- Name: court_cases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.court_cases_id_seq', 25, true);


--
-- Name: education_plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.education_plans_id_seq', 100, true);


--
-- Name: family_socioeconomic_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.family_socioeconomic_records_id_seq', 25, true);


--
-- Name: family_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.family_types_id_seq', 1, false);


--
-- Name: follow_ups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.follow_ups_id_seq', 22, true);


--
-- Name: guardian_visits_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.guardian_visits_id_seq', 34, true);


--
-- Name: guardians_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.guardians_id_seq', 9, true);


--
-- Name: health_assessments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.health_assessments_id_seq', 25, true);


--
-- Name: measurement_surveys_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.measurement_surveys_id_seq', 25, true);


--
-- Name: police_acquisitions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.police_acquisitions_id_seq', 18, true);


--
-- Name: release_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.release_records_id_seq', 2, true);


--
-- Name: risk_assessments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.risk_assessments_id_seq', 25, true);


--
-- Name: role_center_access_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.role_center_access_id_seq', 1, false);


--
-- Name: role_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.role_permissions_id_seq', 1034, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 12, true);


--
-- Name: trainings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.trainings_id_seq', 5, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 23, true);


--
-- Name: workflow_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.workflow_logs_id_seq', 1, false);


--
-- Name: administrative_units administrative_units_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrative_units
    ADD CONSTRAINT administrative_units_pkey PRIMARY KEY (id);


--
-- Name: admissions admissions_admission_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admissions
    ADD CONSTRAINT admissions_admission_id_unique UNIQUE (admission_id);


--
-- Name: admissions admissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admissions
    ADD CONSTRAINT admissions_pkey PRIMARY KEY (id);


--
-- Name: case_agreements case_agreements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_agreements
    ADD CONSTRAINT case_agreements_pkey PRIMARY KEY (id);


--
-- Name: case_detail_assessments case_detail_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_detail_assessments
    ADD CONSTRAINT case_detail_assessments_pkey PRIMARY KEY (id);


--
-- Name: case_intervention_plans case_intervention_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_intervention_plans
    ADD CONSTRAINT case_intervention_plans_pkey PRIMARY KEY (id);


--
-- Name: case_risk_assessments case_risk_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_risk_assessments
    ADD CONSTRAINT case_risk_assessments_pkey PRIMARY KEY (id);


--
-- Name: case_types case_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_types
    ADD CONSTRAINT case_types_pkey PRIMARY KEY (id);


--
-- Name: cases cases_case_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_case_id_unique UNIQUE (case_id);


--
-- Name: cases cases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_pkey PRIMARY KEY (id);


--
-- Name: centers centers_center_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.centers
    ADD CONSTRAINT centers_center_name_unique UNIQUE (center_name);


--
-- Name: centers centers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.centers
    ADD CONSTRAINT centers_pkey PRIMARY KEY (id);


--
-- Name: children children_child_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.children
    ADD CONSTRAINT children_child_id_unique UNIQUE (child_id);


--
-- Name: children children_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.children
    ADD CONSTRAINT children_pkey PRIMARY KEY (id);


--
-- Name: classes classes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_pkey PRIMARY KEY (id);


--
-- Name: counseling_sessions counseling_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.counseling_sessions
    ADD CONSTRAINT counseling_sessions_pkey PRIMARY KEY (id);


--
-- Name: counseling_sessions counseling_sessions_session_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.counseling_sessions
    ADD CONSTRAINT counseling_sessions_session_id_unique UNIQUE (session_id);


--
-- Name: court_cases court_cases_court_case_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.court_cases
    ADD CONSTRAINT court_cases_court_case_id_unique UNIQUE (court_case_id);


--
-- Name: court_cases court_cases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.court_cases
    ADD CONSTRAINT court_cases_pkey PRIMARY KEY (id);


--
-- Name: education_plans education_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.education_plans
    ADD CONSTRAINT education_plans_pkey PRIMARY KEY (id);


--
-- Name: education_plans education_plans_plan_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.education_plans
    ADD CONSTRAINT education_plans_plan_id_unique UNIQUE (plan_id);


--
-- Name: family_socioeconomic_records family_socioeconomic_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.family_socioeconomic_records
    ADD CONSTRAINT family_socioeconomic_records_pkey PRIMARY KEY (id);


--
-- Name: family_socioeconomic_records family_socioeconomic_records_record_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.family_socioeconomic_records
    ADD CONSTRAINT family_socioeconomic_records_record_id_unique UNIQUE (record_id);


--
-- Name: family_types family_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.family_types
    ADD CONSTRAINT family_types_pkey PRIMARY KEY (id);


--
-- Name: follow_ups follow_ups_follow_up_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follow_ups
    ADD CONSTRAINT follow_ups_follow_up_id_unique UNIQUE (follow_up_id);


--
-- Name: follow_ups follow_ups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follow_ups
    ADD CONSTRAINT follow_ups_pkey PRIMARY KEY (id);


--
-- Name: guardian_visits guardian_visits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guardian_visits
    ADD CONSTRAINT guardian_visits_pkey PRIMARY KEY (id);


--
-- Name: guardian_visits guardian_visits_visit_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guardian_visits
    ADD CONSTRAINT guardian_visits_visit_id_unique UNIQUE (visit_id);


--
-- Name: guardians guardians_guardian_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guardians
    ADD CONSTRAINT guardians_guardian_id_unique UNIQUE (guardian_id);


--
-- Name: guardians guardians_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guardians
    ADD CONSTRAINT guardians_pkey PRIMARY KEY (id);


--
-- Name: health_assessments health_assessments_assessment_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.health_assessments
    ADD CONSTRAINT health_assessments_assessment_id_unique UNIQUE (assessment_id);


--
-- Name: health_assessments health_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.health_assessments
    ADD CONSTRAINT health_assessments_pkey PRIMARY KEY (id);


--
-- Name: measurement_surveys measurement_surveys_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.measurement_surveys
    ADD CONSTRAINT measurement_surveys_pkey PRIMARY KEY (id);


--
-- Name: measurement_surveys measurement_surveys_survey_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.measurement_surveys
    ADD CONSTRAINT measurement_surveys_survey_id_unique UNIQUE (survey_id);


--
-- Name: police_acquisitions police_acquisitions_acquisition_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.police_acquisitions
    ADD CONSTRAINT police_acquisitions_acquisition_id_unique UNIQUE (acquisition_id);


--
-- Name: police_acquisitions police_acquisitions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.police_acquisitions
    ADD CONSTRAINT police_acquisitions_pkey PRIMARY KEY (id);


--
-- Name: release_records release_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.release_records
    ADD CONSTRAINT release_records_pkey PRIMARY KEY (id);


--
-- Name: release_records release_records_release_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.release_records
    ADD CONSTRAINT release_records_release_id_unique UNIQUE (release_id);


--
-- Name: risk_assessments risk_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.risk_assessments
    ADD CONSTRAINT risk_assessments_pkey PRIMARY KEY (id);


--
-- Name: risk_assessments risk_assessments_risk_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.risk_assessments
    ADD CONSTRAINT risk_assessments_risk_id_unique UNIQUE (risk_id);


--
-- Name: role_center_access role_center_access_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_center_access
    ADD CONSTRAINT role_center_access_pkey PRIMARY KEY (id);


--
-- Name: role_center_access role_center_access_role_center_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_center_access
    ADD CONSTRAINT role_center_access_role_center_unique UNIQUE (role_id, center_id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_role_module_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_module_unique UNIQUE (role_id, module);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: roles roles_role_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_role_name_unique UNIQUE (role_name);


--
-- Name: trainings trainings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trainings
    ADD CONSTRAINT trainings_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: workflow_logs workflow_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_logs
    ADD CONSTRAINT workflow_logs_pkey PRIMARY KEY (id);


--
-- Name: administrative_units administrative_units_linked_center_id_centers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrative_units
    ADD CONSTRAINT administrative_units_linked_center_id_centers_id_fk FOREIGN KEY (linked_center_id) REFERENCES public.centers(id);


--
-- Name: admissions admissions_center_id_centers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admissions
    ADD CONSTRAINT admissions_center_id_centers_id_fk FOREIGN KEY (center_id) REFERENCES public.centers(id);


--
-- Name: admissions admissions_child_id_children_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admissions
    ADD CONSTRAINT admissions_child_id_children_id_fk FOREIGN KEY (child_id) REFERENCES public.children(id);


--
-- Name: case_agreements case_agreements_case_id_cases_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_agreements
    ADD CONSTRAINT case_agreements_case_id_cases_id_fk FOREIGN KEY (case_id) REFERENCES public.cases(id);


--
-- Name: case_detail_assessments case_detail_assessments_case_id_cases_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_detail_assessments
    ADD CONSTRAINT case_detail_assessments_case_id_cases_id_fk FOREIGN KEY (case_id) REFERENCES public.cases(id);


--
-- Name: case_intervention_plans case_intervention_plans_case_id_cases_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_intervention_plans
    ADD CONSTRAINT case_intervention_plans_case_id_cases_id_fk FOREIGN KEY (case_id) REFERENCES public.cases(id);


--
-- Name: case_risk_assessments case_risk_assessments_case_id_cases_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_risk_assessments
    ADD CONSTRAINT case_risk_assessments_case_id_cases_id_fk FOREIGN KEY (case_id) REFERENCES public.cases(id);


--
-- Name: cases cases_child_id_children_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_child_id_children_id_fk FOREIGN KEY (child_id) REFERENCES public.children(id);


--
-- Name: children children_center_id_centers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.children
    ADD CONSTRAINT children_center_id_centers_id_fk FOREIGN KEY (center_id) REFERENCES public.centers(id);


--
-- Name: counseling_sessions counseling_sessions_child_id_children_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.counseling_sessions
    ADD CONSTRAINT counseling_sessions_child_id_children_id_fk FOREIGN KEY (child_id) REFERENCES public.children(id);


--
-- Name: court_cases court_cases_child_id_children_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.court_cases
    ADD CONSTRAINT court_cases_child_id_children_id_fk FOREIGN KEY (child_id) REFERENCES public.children(id);


--
-- Name: education_plans education_plans_child_id_children_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.education_plans
    ADD CONSTRAINT education_plans_child_id_children_id_fk FOREIGN KEY (child_id) REFERENCES public.children(id);


--
-- Name: family_socioeconomic_records family_socioeconomic_records_child_id_children_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.family_socioeconomic_records
    ADD CONSTRAINT family_socioeconomic_records_child_id_children_id_fk FOREIGN KEY (child_id) REFERENCES public.children(id);


--
-- Name: follow_ups follow_ups_child_id_children_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follow_ups
    ADD CONSTRAINT follow_ups_child_id_children_id_fk FOREIGN KEY (child_id) REFERENCES public.children(id);


--
-- Name: guardian_visits guardian_visits_child_id_children_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guardian_visits
    ADD CONSTRAINT guardian_visits_child_id_children_id_fk FOREIGN KEY (child_id) REFERENCES public.children(id);


--
-- Name: guardian_visits guardian_visits_guardian_id_guardians_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guardian_visits
    ADD CONSTRAINT guardian_visits_guardian_id_guardians_id_fk FOREIGN KEY (guardian_id) REFERENCES public.guardians(id);


--
-- Name: guardians guardians_child_id_children_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guardians
    ADD CONSTRAINT guardians_child_id_children_id_fk FOREIGN KEY (child_id) REFERENCES public.children(id);


--
-- Name: health_assessments health_assessments_child_id_children_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.health_assessments
    ADD CONSTRAINT health_assessments_child_id_children_id_fk FOREIGN KEY (child_id) REFERENCES public.children(id);


--
-- Name: measurement_surveys measurement_surveys_center_id_centers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.measurement_surveys
    ADD CONSTRAINT measurement_surveys_center_id_centers_id_fk FOREIGN KEY (center_id) REFERENCES public.centers(id);


--
-- Name: measurement_surveys measurement_surveys_child_id_children_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.measurement_surveys
    ADD CONSTRAINT measurement_surveys_child_id_children_id_fk FOREIGN KEY (child_id) REFERENCES public.children(id);


--
-- Name: police_acquisitions police_acquisitions_child_id_children_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.police_acquisitions
    ADD CONSTRAINT police_acquisitions_child_id_children_id_fk FOREIGN KEY (child_id) REFERENCES public.children(id);


--
-- Name: release_records release_records_child_id_children_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.release_records
    ADD CONSTRAINT release_records_child_id_children_id_fk FOREIGN KEY (child_id) REFERENCES public.children(id);


--
-- Name: risk_assessments risk_assessments_child_id_children_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.risk_assessments
    ADD CONSTRAINT risk_assessments_child_id_children_id_fk FOREIGN KEY (child_id) REFERENCES public.children(id);


--
-- Name: role_center_access role_center_access_center_id_centers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_center_access
    ADD CONSTRAINT role_center_access_center_id_centers_id_fk FOREIGN KEY (center_id) REFERENCES public.centers(id);


--
-- Name: role_center_access role_center_access_role_id_roles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_center_access
    ADD CONSTRAINT role_center_access_role_id_roles_id_fk FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: role_permissions role_permissions_role_id_roles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_roles_id_fk FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: users users_administrative_unit_id_administrative_units_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_administrative_unit_id_administrative_units_id_fk FOREIGN KEY (administrative_unit_id) REFERENCES public.administrative_units(id);


--
-- Name: users users_center_id_centers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_center_id_centers_id_fk FOREIGN KEY (center_id) REFERENCES public.centers(id);


--
-- Name: users users_role_id_roles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_roles_id_fk FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: workflow_logs workflow_logs_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_logs
    ADD CONSTRAINT workflow_logs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict hY7YziTbbQr1GtRsUz2mG5rKQLmCzgHtO1z0M2FG3yJVVjtbOzwlPlfmrcZvlaB

