# Changelog

All notable changes to @ralphschuler/screeps-kernel will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- OS-style process architecture based on "Writing an OS for Screeps" Gist
- `OSProcess` base class with Memory serialization support
- Process lifecycle management (add, kill, get by ID)
- Memory-persisted process table with automatic storage/loading
- Parent-child process relationships
- Per-process memory namespaces in `Memory.processMemory[pid]`
- Process class registration system for className-based instantiation
- Comprehensive test suite for OS kernel (85 tests total)
- OS architecture documentation with API reference
- Example implementations for mineral mining and task priority scenarios
- `resetOSKernel()` function for test isolation
- Framework documentation and examples
- npm publishing workflow

## [0.1.0] - 2024-12-30

### Added
- Initial extraction from screeps-ant-swarm bot
- Kernel process scheduler with CPU budget management
- Priority-based task scheduling
- Wrap-around queue for fair processing
- CPU budget enforcement
- Process lifecycle management
- Process registration and deregistration
- Comprehensive test suite
- Full TypeScript type definitions

[Unreleased]: https://github.com/ralphschuler/screeps/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/ralphschuler/screeps/releases/tag/v0.1.0
