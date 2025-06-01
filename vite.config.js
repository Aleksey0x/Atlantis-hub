import { defineConfig } from 'vite';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import createSvgSpritePlugin from 'vite-plugin-svg-sprite';
import { resolve } from 'path'; // Импортируем resolve из 'path' для корректного определения путей
import glob from 'glob'; // Импортируем glob (default import for CJS compatibility)

export default defineConfig({
	root: resolve(__dirname, 'src'), // <-- ИЗМЕНЕНИЕ: Устанавливаем корень проекта в 'src'
	// Настройки сервера разработки
	server: {
		port: 3000,        // Порт, на котором будет запущен сервер разработки
		open: true,        // Автоматически открывать браузер при запуске сервера
		cors: true,        // Включает CORS для всех маршрутов
		hmr: {
			overlay: true    // Показывать оверлей с ошибками при Hot Module Replacement
		},
		watch: {
			usePolling: true // Использовать polling для отслеживания изменений файлов
		}
	},

	// Настройки CSS
	css: {
		preprocessorOptions: {
			scss: {
				// Добавьте глобальные переменные/миксины если нужно

			}
		},
		postcss: {
			plugins: [
				autoprefixer({
					grid: 'autoplace' // Поддержка CSS Grid для IE
				}),
				cssnano({
					preset: ['default', {
						discardComments: {
							removeAll: true,
						},
						reduceIdents: false, // Безопаснее для анимаций
						zIndex: false, // Не трогать z-index
					}]
				})
			],
		},
		// Извлечение CSS для лучшего кеширования
		// extract: true, // Для dev-режима с root: 'src' может не требоваться или вызывать проблемы с путями, проверяем. Vite по умолчанию обрабатывает CSS корректно.
	},

	// Настройки сборки
	build: {
		outDir: resolve(__dirname, 'dist'), // <-- ИЗМЕНЕНИЕ: Явно указываем выходную директорию относительно корня проекта (где vite.config.js)
		emptyOutDir: true, // Очищает папку dist перед сборкой
		minify: 'terser',  // Использовать Terser для минификации JavaScript
		cssMinify: true,   // Минифицировать CSS

		// Оптимизация размера чанков
		chunkSizeWarningLimit: 500,

		// Улучшенные настройки Terser
		terserOptions: {
			compress: {
				drop_console: true, // Удаляет console.log в production
				drop_debugger: true, // Удаляет debugger в production
				pure_funcs: ['console.log', 'console.info'], // Удаляет console.log и console.info в production
				passes: 2, // Больше проходов = лучше сжатие
			},

			mangle: {
				safari10: true, // Совместимость с Safari 10
			},

			format: {
				comments: false, // Удалить все комментарии
				// Сохранить важные комментарии (лицензии)
				preserve_annotations: true,
			}
		},

		// Настройки для многостраничного режима
		rollupOptions: {

			// Настройки для входных файлов
			input: {
				// Определяем точки входа для многостраничного режима
				// main: resolve(__dirname, 'index.html'), // <-- ИЗМЕНЕНИЕ: Было (относительно корня проекта)
				main: resolve(__dirname, 'src/index.html'), // <-- ИЗМЕНЕНИЕ: Стало (относительно корня проекта, указываем на файл в src)
				// types: resolve(__dirname, 'pages/types.html'), // <-- ИЗМЕНЕНИЕ: Было
				// Динамически добавляем все HTML файлы из src/pages
				...Object.fromEntries(
					glob.sync(resolve(__dirname, 'src/pages/**/*.html')).map(file => [
						// Имя точки входа: pages/filename (без .html)
						file.slice(resolve(__dirname, 'src/').length + 1, file.length - '.html'.length),
						file
					])
				)
			},

			// Настройки для сборки
			output: {
				// Оптимизированная структура файлов
				chunkFileNames: 'assets/js/[name]-[hash].js',    // Имена чанков JavaScript
				entryFileNames: 'assets/js/[name]-[hash].js',    // Имена входных файлов JavaScript

				// Настройка имен файлов для ассетов
				assetFileNames: (assetInfo) => {
					// Более умная организация ассетов
					const info = assetInfo.name.split('.');
					const ext = info[info.length - 1];
					if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
						return `assets/images/[name]-[hash][extname]`;
					} else if (/woff2?|ttf|otf|eot/i.test(ext)) {
						return `assets/fonts/[name]-[hash][extname]`;
					} else if (/css/i.test(ext)) {
						return `assets/css/[name]-[hash][extname]`;
					}
					return `assets/[name]-[hash][extname]`;
				},

				// Ручное разделение чанков для лучшего кеширования
				manualChunks: {
					// Выносим GSAP в отдельный чанк
					gsap: ['gsap'],
					// Vendor чанк для других библиотек
					vendor: ['slideout'],
				}
			},

			// Оптимизация для современных браузеров
			treeshake: {
				preset: 'recommended',
				moduleSideEffects: 'no-external',
			}
		},

		// Настройки для современных браузеров
		target: 'es2018', // Более современный таргет

		// Генерация отчета о размере бандла
		reportCompressedSize: true,

		// Оптимизация ассетов
		assetsInlineLimit: 4096, // Инлайнить файлы < 4kb
	},

	// Оптимизация для продакшена
	esbuild: {
		legalComments: 'none', // Удалить комментарии
		minifyIdentifiers: true,
		minifySyntax: true,
		minifyWhitespace: true,
	},

	// Настройки для путей и плагинов
	publicDir: resolve(__dirname, 'public'), // <-- ИЗМЕНЕНИЕ: Явно указываем папку public относительно корня проекта
	base: './', // Оставляем './' для корректных относительных путей в собранном проекте

	plugins: [
		// Плагин для создания SVG спрайта
		createSvgSpritePlugin({
			exportType: 'vanilla',
			// include: '**/icons/*.svg' // <-- ИЗМЕНЕНИЕ: Было (относительно корня проекта)
			include: 'assets/icons/**/*.svg' // <-- ИЗМЕНЕНИЕ: Путь теперь относительно root ('src')
		}),
	],

	resolve: { // <-- ИЗМЕНЕНИЕ: Добавляем секцию resolve для алиасов, если понадобятся
		alias: {
			'@': resolve(__dirname, 'src'),
			'@img': resolve(__dirname, 'src/assets/images'),
			'@fonts': resolve(__dirname, 'src/assets/fonts'),
			'@js': resolve(__dirname, 'src/js'),
			'@css': resolve(__dirname, 'src/css'),
		}
	},

	optimizeDeps: {
		include: ['gsap', 'slideout'], // Предварительная оптимизация
	}
}); 