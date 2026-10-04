{# Usa o nome do schema como está (staging, marts), sem o prefixo padrão do dbt. #}
{% macro generate_schema_name(custom_schema_name, node) -%}
    {{ custom_schema_name or target.schema }}
{%- endmacro %}
