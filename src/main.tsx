/**
 * Wasla v18 Entrypoint (TypeScript + React 18 + Security Shield)
 * يعمل داخل نطاق معزول بالكامل (IIFE Closure) بدون أي متغيرات عامة قابلة للتلاعب من المتصفح
 */
import { installSecurityRuntime } from './security/shield';
import { bootstrapWaslaApp } from './app/wasla-core';

installSecurityRuntime();
bootstrapWaslaApp();
