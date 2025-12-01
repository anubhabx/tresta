/**
 * Tests for Logger utility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger } from '../logger.js';

describe('Logger', () => {
  let consoleDebugSpy: any;
  let consoleLogSpy: any;
  let consoleWarnSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => { });
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create logger with widget ID and version', () => {
      const logger = new Logger('widget-123', '1.2.3', false);

      expect(logger.getWidgetId()).toBe('widget-123');
      expect(logger.getVersion()).toBe('1.2.3');
      expect(logger.isDebugEnabled()).toBe(false);
    });

    it('should default to version 1.0.0 if not provided', () => {
      const logger = new Logger('widget-123');

      expect(logger.getVersion()).toBe('1.0.0');
    });

    it('should default debug to false if not provided', () => {
      const logger = new Logger('widget-123', '1.0.0');

      expect(logger.isDebugEnabled()).toBe(false);
    });
  });

  describe('debug logging', () => {
    it('should log debug messages when debug is enabled', () => {
      const logger = new Logger('widget-123', '1.2.3', true);

      logger.debug('Test message', { foo: 'bar' });

      expect(consoleDebugSpy).toHaveBeenCalledWith(
        '[TrestaWidget v1.2.3]',
        'Test message',
        { foo: 'bar' }
      );
    });

    it('should NOT log debug messages when debug is disabled', () => {
      const logger = new Logger('widget-123', '1.2.3', false);

      logger.debug('Test message', { foo: 'bar' });

      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });

    it('should include version in debug messages', () => {
      const logger = new Logger('widget-123', '2.0.0', true);

      logger.debug('Initialization');

      expect(consoleDebugSpy).toHaveBeenCalledWith(
        '[TrestaWidget v2.0.0]',
        'Initialization'
      );
    });
  });

  describe('info logging', () => {
    it('should always log info messages', () => {
      const logger = new Logger('widget-123', '1.2.3', false);

      logger.info('Info message', { data: 'test' });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[TrestaWidget v1.2.3]',
        'Info message',
        { data: 'test' }
      );
    });

    it('should log info messages even when debug is enabled', () => {
      const logger = new Logger('widget-123', '1.2.3', true);

      logger.info('Info message');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[TrestaWidget v1.2.3]',
        'Info message'
      );
    });
  });

  describe('warn logging', () => {
    it('should always log warning messages', () => {
      const logger = new Logger('widget-123', '1.2.3', false);

      logger.warn('Warning message', { issue: 'test' });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[TrestaWidget v1.2.3]',
        'Warning message',
        { issue: 'test' }
      );
    });
  });

  describe('error logging', () => {
    it('should always log error messages', () => {
      const logger = new Logger('widget-123', '1.2.3', false);

      logger.error('Error message', new Error('Test error'));

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[TrestaWidget v1.2.3]',
        'Error message',
        expect.any(Error)
      );
    });
  });

  describe('logEmpty', () => {
    it('should log empty state when debug is enabled', () => {
      const logger = new Logger('widget-123', '1.2.3', true);

      logger.logEmpty();

      expect(consoleDebugSpy).toHaveBeenCalledWith(
        '[TrestaWidget v1.2.3] empty'
      );
    });

    it('should NOT log empty state when debug is disabled', () => {
      const logger = new Logger('widget-123', '1.2.3', false);

      logger.logEmpty();

      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });
  });

  describe('version formatting', () => {
    it('should include version in all log messages', () => {
      const logger = new Logger('widget-123', '3.1.4', true);

      logger.debug('Debug');
      logger.info('Info');
      logger.warn('Warn');
      logger.error('Error');

      expect(consoleDebugSpy).toHaveBeenCalledWith('[TrestaWidget v3.1.4]', 'Debug');
      expect(consoleLogSpy).toHaveBeenCalledWith('[TrestaWidget v3.1.4]', 'Info');
      expect(consoleWarnSpy).toHaveBeenCalledWith('[TrestaWidget v3.1.4]', 'Warn');
      expect(consoleErrorSpy).toHaveBeenCalledWith('[TrestaWidget v3.1.4]', 'Error');
    });
  });
});
