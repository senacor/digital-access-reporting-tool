# 📊 Report Aggregation

The report aggregation is separated into **two** main tasks. The [single-page report](#single-page-report) creation and the [multi-page report](#multi-page-report) creation. As a basis for the aggregation, _IBM's Accessibility Checker_ reports are used.

## Important files/folders:

- _[calculateElementsWithNoViolationsPercentage.ts](./calculateElementsWithNoViolationsPercentage.ts)_: Calculates the percentage of all elements that have not caused a rule violation.
- _[createMultiPageReport.ts](./createMultiPageReport.ts)_: Creates a [multi-page report](#multi-page-report).
- _[createSinglePageReport.ts](./createSinglePageReport.ts)_: Creates a [single-page report](#single-page-report).
- _[findCategoryByLevelAndRuleId.ts](./findCategoryByLevelAndRuleId.ts)_: This provides a function that finds a category for a given `level` and `ruleId` by using the following two files _levelARuleIdsByCategory.ts_ and _levelAARuleIdsByCategory.ts_.
- _[levelARuleIdsByCategory.ts](./levelARuleIdsByCategory.ts)_: Contains all `ruleIds` in a `Set` for level A and the associated category. This is important because we need to figure out the `category` and `level` for a `ruleId` when the aggregation takes place.
- _[levelAARuleIdsByCategory.ts](./levelAARuleIdsByCategory.ts)_: Contains all `ruleIds` in a `Set` for level AA and the associated category. This is important because we need to figure out the `category` and `level` for a `ruleId` when the aggregation takes place.
- _[types.ts](./types.ts)_: Contains the types for the single- and multi-page reports and all other types needed for the aggregation.
- _[wcag_2.2_rules_categorization.md](./wcag_2.2_rules_categorization.md)_: Contains all `ruleIds` of the WCAG 2.2 ruleset associated with custom categories and labeled with the level (A or AA). In the future, there will be a WCAG 3.0 ruleset that will contain another level AAA. Then we'll need to re-think/adjust our custom associations.
- _[wcag_2.2_rules_categorization.md](./wcag_2.2_rules_categorization.md)_: Contains all `ruleIds` of the WCAG 2.2 ruleset associated with custom categories and labeled with the level (A or AA). In the future, there will be a WCAG 3.0 ruleset that will contain another level AAA. Then we'll need to re-think/adjust our custom associations.

## Single-page Report

The [createSinglePageReport](./createMultiPageReport.ts) function takes one _IBM's Accessibility Checker_ report and loops through all `ruleIds` from the objects in the `accessibilityCheckerReport.results` array.
For each `ruleId` it gets the corresponding `level` and `category` and counts how often this rule has been violated.
This information is then aggregated and stored in the report on different levels besides some other valuable information.

An example of a single-page report output can be viewed in the [types.ts](./types.ts).

## Multi-page Report

The [createMultiPageReport](./createMultiPageReport.ts) function takes in a URL, a logo URL, a screenshot path and an array of _IBM's Accessibility Checker_ reports. It then loops over all the reports, creates [single-page reports](#single-page-report) and aggregates all these single-page reports into one multi-page report that contains the passed information.

An example of a multi-page report output can be viewed in the [types.ts](./types.ts).
