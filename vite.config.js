import { defineConfig } from 'vite';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import createSvgSpritePlugin from 'vite-plugin-svg-sprite';
import { resolve } from 'path'; // Импортируем resolve из 'path' для корректного определения путей

export default defineConfig({
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
						zindex: false, // Не трогать z-index
					}]
				})
			],
		},
		// Извлечение CSS для лучшего кеширования
		extract: true,
	},

	// Настройки сборки
	build: {
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
				main: resolve(__dirname, 'index.html'), // Главная страница
				types: resolve(__dirname, 'pages/types.html'),
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
	base: './',

	plugins: [
		// Плагин для создания SVG спрайта
		createSvgSpritePlugin({
			exportType: 'vanilla',
			include: '**/icons/*.svg'
		}),
	],

	optimizeDeps: {
		include: ['gsap', 'slideout'], // Предварительная оптимизация
	}
}); 