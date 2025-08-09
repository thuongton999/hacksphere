# Monorepo Guidelines

This repository is structured as a monorepo to streamline development across multiple projects. Below are some basic guidelines to help you navigate and work effectively within this setup.

## Folder Structure Overview

- **/apps/core/**  
  Contains the backend services and APIs. This is where the core logic and server-side components reside.

- **/apps/webapp/**  
  Houses the web application (frontend). All client-side code and related assets are maintained here.

- **/packages/ui/**  
  Shared UI components that can be used across different applications. This helps in maintaining consistency and reusability.

- **/packages/core-ai/**  
  Dedicated to AI-related features and agents. Any advanced functionalities powered by AI should be developed here.

*... further more directories may be added as the project evolves.*

## Development Guidelines

1. **Consistency & Structure**  
   - Adhere to the existing folder conventions when adding new modules or features.
   - Ensure that all new code follows the repository’s style and naming conventions.

2. **Modular Development**  
   - Develop new features within their respective directories.
   - When functionality is shared between apps, consider placing it in the appropriate package to promote reuse.

3. **Dependency Management**  
   - Use monorepo tools (e.g., Yarn Workspaces, Lerna, Nx) to manage inter-package dependencies.
   - Keep dependencies synchronized to avoid version conflicts.

4. **Building & Testing**  
   - Each application and package should have its build and test scripts.
   - Run tests locally for the component you are working on, and execute global builds to verify integration.

5. **CI/CD Integration**  
   - Configure CI pipelines to target only the changed areas of the repository.
   - Prioritize modular testing and incremental builds to improve efficiency.

6. **Documentation & Maintenance**  
   - Update relevant sections of the README or dedicated documentation when adding new features or restructuring code.
   - Follow commit message conventions and contribution guidelines to keep project history clear and informative.

By adhering to these guidelines, you ensure that each component remains modular, maintainable, and scalable within the monorepo structure.

