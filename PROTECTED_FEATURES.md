# Protected Features in Skillgenix Platform

This document identifies features that are fully functional and should not be modified without specific approval. These features have been thoroughly tested and are critical to the platform's operation.

## Personal Career Pathway Analysis

**Status: PROTECTED - DO NOT MODIFY**

The Personal Career Pathway Analysis feature is fully functional and should not be modified when working on other sections of the application.

### Protected Files and Directories:
- `client/src/components/career-pathway/` (entire directory)
- `server/openai-service-fixed.ts`
- `server/routes` (only the career analysis endpoints)
- `server/db/models/careerAnalysis.ts`
- `server/db/models/careerPathway.ts`

### Protected API Endpoints:
- `/api/career-analysis`
- Any other endpoints specific to the Career Pathway functionality

### Functionality Summary:
The Career Pathway Analysis provides users with:
- Skill assessment based on current skills vs. desired role
- Gap analysis using SFIA 9 and DigComp 2.2 frameworks
- Dual pathway options (with/without degree)
- PDF report generation with visualizations
- Dashboard saving functionality

### When to Request Changes:
Changes to these protected files should only be made when:
1. Fixing critical bugs directly related to the Career Pathway functionality
2. Adding new features specifically requested for the Career Pathway section
3. Implementing security patches that affect the protected components

### Protocol for Making Changes:
1. Clearly document the proposed changes
2. Create a backup of the current functionality
3. Test all changes thoroughly in a development environment before deploying
4. Update this document with the changes made and the reason for the changes

## Update History

| Date | Component Modified | Reason | Approved By |
|------|-------------------|--------|------------|
| 2025-04-26 | Button styling in Career Pathway interface | UI consistency improvement | Client |
