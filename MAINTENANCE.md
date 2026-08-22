# Maintenance Notes

- Keep Pega portal integration behavior isolated from presentation changes where possible.
- Keep environment examples in `.env.example` synchronized with the variables expected by the application.
- Run the normal frontend build and lint checks before submitting changes.
- Treat renderer output changes as compatibility-sensitive and validate representative Pega content after UI updates.
