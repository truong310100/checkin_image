# Coding Style Guide BE
- Controllers, routes, middleware, utils: plain functions, module.exports = {}
- Service: OOP + SOLID business logic only use transaction no logic in controller
- Do not create new flow
- Naming conventions strictly enforced
- Do not change business logic when refactoring
- Do not introduce new abstractions

# Coding style guide FE
- The following UI elements MUST be implemented
as shared components and MUST be reused: Button ,Input ,Select ,Checkbox ,Radio ,Table ,Modal ,Pagination ,Dropdown ,Tooltip,...
- Always use icon library, no emojis
- Manager state with Redux or Context API
- Do not create new UI, always reuse existing components
- Use functional components + hooks
- UI Table always have pagination + search + filter + sort + limit

# Setting for Copilot Chat
- All imports at top of file
- One file = one responsibility
- Function <= 40 lines
- No deep nesting
- Always step by step
- Use Vietnamese in chat