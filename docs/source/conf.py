# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

project = 'nohub'
copyright = '2025, Fox\'s Sake Studio'
author = 'Tamás Gálffy'

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

extensions = ['sphinx_tabs.tabs', 'sphinx_design']

templates_path = ['_templates']
exclude_patterns = []



# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

html_theme = 'breeze'
html_static_path = ['_static']
html_css_files = ['tabs.css']

html_title = 'nohub'

html_context = {
    'github_user': 'foxssake',
    'github_repo': 'nohub',
    'github_version': 'main',
    'doc_path': 'docs/source'
}
