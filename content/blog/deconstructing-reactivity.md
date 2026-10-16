---
title: 'Deconstructing Reactivity: How I Built an Engine from Scratch to Master the Concepts'
description: 'What rebuilding signals, effects, batching, lazy evaluation, and ownership taught me about modern reactive systems.'
date: '2026-01-07'
tags:
  - TypeScript
  - Reactivity
  - Angular Signals
featured: true
published: true
---

With the recent shift in the frontend ecosystem—from Angular Signals to Vue Refs and Solid primitives—reactivity has become the fundamental driver of modern UI development.

As developers, we rely on these abstractions daily. We trust that setting a signal updates the view, and we trust that computed values cache their results efficiently. But there is a distinct difference between knowing _how_ to use a tool and understanding _how it works_.

I wasn’t struggling to use these tools, but I wanted to deepen my understanding of the architectural decisions behind them. Why is “glitch-free” execution so critical? How does dependency tracking actually work without manual subscriptions? What is the real difference between eager and lazy evaluation?

To answer these questions, I decided to build **ts-reactivity-engine**: a zero-dependency, educational reactivity engine built entirely from scratch in TypeScript.

Here is what I learned by rebuilding the core primitives of the modern web.

## The Engineering Challenge

My goal was to create a scaffold that evolved from a naive implementation to a robust, architecture-aware engine. I wanted to replicate the journey framework authors take, solving one bottleneck at a time.

The project is structured into four distinct levels of complexity.

## Level 1: The Naive “Push” Model

I started with the simplest definition of reactivity: **Dependency Tracking**.

In this stage, I implemented the basic signal and effect. The concept is straightforward: usage of a global context variable allows a signal to register who is listening to it. When the signal changes, it immediately “pushes” updates to all listeners.

**The lesson:** While functional, this “eager” approach highlighted why frameworks are complex.

- **Memory leaks:** Without careful management, effects subscribe to signals and never let go, creating “zombie listeners.”
- **Glitches:** Updating multiple signals caused cascading, redundant re-renders—a performance killer in real applications.

## Level 2: Safety and Batching

To address the limitations of the first implementation, I had to introduce **Cleanup** and **Batching**.

This stage taught me the importance of the lifecycle. Before an effect re-runs, it must “forget” its previous dependencies. This is crucial for dynamic branching—for example, `condition ? A() : B()`. If `condition` flips, the engine must stop listening to `A` immediately.

I also implemented a global batching queue. This ensures that multiple synchronous state changes result in a single, consistent execution, preventing the “Diamond Problem.”

## Level 3: The “Push-Pull” Architecture

This was the most significant architectural shift. Modern frameworks don’t just “push” updates. They use a **Push-Pull** hybrid.

- **Push:** When a signal changes, it marks its dependents as “dirty.” It does not re-run them immediately.
- **Pull:** A computed value is re-evaluated only when it is actually read.

Implementing this highlighted the laziness of modern frameworks. It ensures that expensive computations for hidden UI components are never executed unnecessarily. It also naturally solves topological sorting issues, ensuring the graph is always consistent without complex scheduling algorithms.

## Level 4: Advanced Primitives

Finally, I integrated features that make a reactivity engine robust enough for complex scenarios.

I added **Cycle Detection** to protect the browser stack from infinite loops, and the **Owner Pattern**—similar to `createRoot`—to manage the disposal of entire reactive trees.

## Conclusion

Building `ts-reactivity-engine` was an exercise in mastery.

By deconstructing these concepts, the “black box” of the framework opens up. When debugging complex race conditions or optimizing performance in an application, I now have a clear mental model of the graph structures underneath.

If you are looking to move from being a consumer of frameworks to deeply understanding their internals, I highly recommend this exercise. You can explore the code and the evolutionary steps in the repository below.

**[Explore ts-reactivity-engine on GitHub](https://github.com/vitNapastiuk98/ts-reactivity-engine)**

_Originally published on [Medium](https://medium.com/@vit.napastiuk/deconstructing-reactivity-how-i-built-an-engine-from-scratch-to-master-the-concepts-bbf9e8a68baf)._
