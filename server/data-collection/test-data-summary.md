# Test Data for Skillgenix

This document summarizes the test data created for the Skillgenix application.

## Core Entities

### 1. Skills
- **Test Skill** (ID: 999)
  - A basic test skill for verification purposes
  - Category: Technical
  - Learning Difficulty: Low
  - Demand Trend: Increasing

- **Basic Programming** (ID: 1001)
  - Prerequisite skill for Test Skill
  - Category: Technical
  - Learning Difficulty: Low
  - Demand Trend: Stable

- **Computer Science Fundamentals** (ID: 1002)
  - Prerequisite skill for Test Skill
  - Category: Technical
  - Learning Difficulty: Medium
  - Demand Trend: Stable

### 2. Roles
- **Test Software Developer** (ID: 999)
  - A test role for verification purposes
  - Category: Information Technology
  - Average Salary: $80,000 - $120,000
  - Demand Outlook: High Growth

### 3. Industries
- **Information Technology** (ID: 999)
  - Category: Technology
  - Growth Outlook: High Growth
  - Disruptive Technologies: AI, Blockchain, Quantum Computing, Edge Computing, 5G
  - Regulations: GDPR, CCPA, HIPAA, PCI DSS

## Relationships

### 1. Role-Skill Relationships
- **Test Software Developer** requires **Test Skill**
  - Importance: Critical
  - Level Required: 3

### 2. Role-Industry Relationships
- **Test Software Developer** has prevalence in **Information Technology**
  - Prevalence: High

### 3. Skill-Industry Relationships
- **Test Skill** is used in **Information Technology**
  - Importance: Critical
  - Trend Direction: Increasing

### 4. Skill Prerequisites
- **Test Skill** requires **Basic Programming**
  - Importance: Critical
- **Test Skill** requires **Computer Science Fundamentals**
  - Importance: Critical

### 5. Learning Resources
- Resource for **Test Skill**:
  - ID: res-999-test
  - Title: "Learn Test Skill - Course"
  - Provider: Skillgenix Academy
  - Type: Course
  - Difficulty: Intermediate
  - Estimated Hours: 10
  - Cost Type: Free

### 6. Career Pathways
- **From Test Software Developer to Senior Test Software Developer**
  - ID: 999
  - Starting Role: Test Software Developer (ID: 999)
  - Target Role: Senior Test Software Developer (ID: 1000)
  - Estimated Time: 3 years
  - Steps:
    1. Build foundational experience (1-2 years)
    2. Advance to senior position (2-3 years)

## How to Interact with Test Data

To work with this test data:

1. Use the various data collection scripts in the `server/data-collection` directory:
   - `add-test-skill.ts`: Add/update the test skill
   - `add-test-role.ts`: Add/update the test role
   - `add-test-industry.ts`: Add/update the test industry
   - `add-test-prerequisites.ts`: Add/update skill prerequisites
   - `create-test-relationships.ts`: Create relationships between entities
   - `add-test-pathway.ts`: Add/update the career pathway

2. Check existing data:
   - `check-generated-data.ts`: View summary and samples of all entities

3. Generate more data:
   - `efficient-generator.ts`: Generate data with batching and caching
   - `modular-generator.ts`: Generate specific types of data modularly
   - `generate-skills-only.ts`: Generate only skills data
   - `generate-roles-only.ts`: Generate only roles data

## Connection to Application Features

This test data enables testing of key application features:

1. **Skill Exploration**: View skill details, prerequisites, and related industries
2. **Role Exploration**: View role details, required skills, and industry prevalence
3. **Industry Exploration**: View industry details, related skills, and roles
4. **Career Pathway Analysis**: View progression paths from entry-level to senior roles
5. **Learning Resource Recommendations**: View resources to learn specific skills
6. **Skill Gap Analysis**: Compare required skills for roles against user skills